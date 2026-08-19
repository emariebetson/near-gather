export interface Clock {
  now(): string;
}

export interface ManualClock extends Clock {
  advanceSeconds(seconds: number): void;
}

export interface OutboxMessage {
  availableAt: string;
  eventId: string;
  invitationId: string | null;
  outboxId: string;
  payload: Readonly<Record<string, unknown>>;
  semanticIdempotencyKey: string;
  topic: string;
}

export interface LeasedOutboxMessage extends OutboxMessage {
  attemptCount: number;
  lastError: string | null;
  leaseExpiresAt: string | null;
  leasedAt: string | null;
  leaseToken: string | null;
  publishedAt: string | null;
}

export interface DeadLetterRecord {
  deadLetteredAt: string;
  lastError: string;
  outboxId: string;
  payload: Readonly<Record<string, unknown>>;
  semanticIdempotencyKey: string;
  topic: string;
}

export interface LeaseAvailableInput {
  leaseDurationSeconds: number;
  limit: number;
  now: string;
}

export interface OutboxRepository {
  hasProcessedSemanticKey(semanticIdempotencyKey: string): boolean;
  leaseAvailable(input: LeaseAvailableInput): Promise<readonly LeasedOutboxMessage[]>;
  markPublished(input: {
    leaseToken: string;
    outboxId: string;
    publishedAt: string;
  }): Promise<void>;
  recordDeadLetter(input: {
    deadLetteredAt: string;
    lastError: string;
    leaseToken: string;
    outboxId: string;
  }): Promise<void>;
  releaseLease(input: {
    availableAt: string;
    lastError: string;
    leaseToken: string;
    outboxId: string;
  }): Promise<void>;
}

export interface InMemoryOutboxSnapshot {
  deadLetters: readonly DeadLetterRecord[];
  messages: readonly LeasedOutboxMessage[];
  processedSemanticKeys: readonly string[];
}

export class RetriableOutboxError extends Error {
  readonly kind = "RETRIABLE_OUTBOX_ERROR";
}

export class TerminalOutboxError extends Error {
  readonly kind = "TERMINAL_OUTBOX_ERROR";
}

export interface OutboxHandlerMap {
  readonly [topic: string]: (message: LeasedOutboxMessage) => Promise<void> | void;
}

export interface CreateOutboxConsumerInput {
  clock: Clock;
  handlers: OutboxHandlerMap;
  maxAttempts?: number;
  repository: OutboxRepository;
}

export interface OutboxRunSummary {
  deadLetteredCount: number;
  deduplicatedCount: number;
  leasedCount: number;
  processedCount: number;
  releasedCount: number;
}

export function createManualClock(initialNow: string): ManualClock {
  let currentTime = new Date(initialNow);

  if (Number.isNaN(currentTime.valueOf())) {
    throw new Error(`Invalid clock seed: ${initialNow}`);
  }

  return {
    advanceSeconds(seconds) {
      currentTime = new Date(currentTime.valueOf() + seconds * 1000);
    },
    now() {
      return currentTime.toISOString();
    }
  };
}

export function createInMemoryOutboxRepository(
  messages: readonly OutboxMessage[]
): OutboxRepository & { snapshot(): InMemoryOutboxSnapshot } {
  const storedMessages: LeasedOutboxMessage[] = messages.map((message) => ({
    ...message,
    attemptCount: 0,
    lastError: null,
    leaseExpiresAt: null,
    leasedAt: null,
    leaseToken: null,
    publishedAt: null
  }));
  const deadLetters: DeadLetterRecord[] = [];
  const processedSemanticKeys = new Set<string>();

  return {
    hasProcessedSemanticKey(semanticIdempotencyKey) {
      return processedSemanticKeys.has(semanticIdempotencyKey);
    },
    async leaseAvailable(input) {
      const now = new Date(input.now).valueOf();
      const leased: LeasedOutboxMessage[] = [];

      for (const message of storedMessages) {
        const available = new Date(message.availableAt).valueOf() <= now;
        const leaseExpired =
          !message.leaseExpiresAt || new Date(message.leaseExpiresAt).valueOf() <= now;

        if (!available || !leaseExpired || message.publishedAt) {
          continue;
        }

        message.attemptCount += 1;
        message.leasedAt = input.now;
        message.leaseExpiresAt = new Date(
          now + input.leaseDurationSeconds * 1000
        ).toISOString();
        message.leaseToken = `${message.outboxId}:lease:${message.attemptCount}`;
        leased.push(cloneLeasedMessage(message));

        if (leased.length >= input.limit) {
          break;
        }
      }

      return leased;
    },
    async markPublished(input) {
      const message = requireLeaseMatch(storedMessages, input.outboxId, input.leaseToken);
      message.publishedAt = input.publishedAt;
      message.lastError = null;
      clearLease(message);
      processedSemanticKeys.add(message.semanticIdempotencyKey);
    },
    async recordDeadLetter(input) {
      const message = requireLeaseMatch(storedMessages, input.outboxId, input.leaseToken);
      message.lastError = input.lastError;
      message.publishedAt = input.deadLetteredAt;
      clearLease(message);
      processedSemanticKeys.add(message.semanticIdempotencyKey);
      deadLetters.push({
        deadLetteredAt: input.deadLetteredAt,
        lastError: input.lastError,
        outboxId: message.outboxId,
        payload: message.payload,
        semanticIdempotencyKey: message.semanticIdempotencyKey,
        topic: message.topic
      });
    },
    async releaseLease(input) {
      const message = requireLeaseMatch(storedMessages, input.outboxId, input.leaseToken);
      message.availableAt = input.availableAt;
      message.lastError = input.lastError;
      clearLease(message);
    },
    snapshot() {
      return {
        deadLetters: deadLetters.map((entry) => ({ ...entry })),
        messages: storedMessages.map(cloneLeasedMessage),
        processedSemanticKeys: [...processedSemanticKeys]
      };
    }
  };
}

export function createOutboxConsumer(input: CreateOutboxConsumerInput): {
  runOnce(config: {
    leaseDurationSeconds: number;
    limit: number;
  }): Promise<OutboxRunSummary>;
} {
  const maxAttempts = input.maxAttempts ?? 5;

  return {
    async runOnce(config) {
      const leased = await input.repository.leaseAvailable({
        leaseDurationSeconds: config.leaseDurationSeconds,
        limit: config.limit,
        now: input.clock.now()
      });
      const summary: OutboxRunSummary = {
        deadLetteredCount: 0,
        deduplicatedCount: 0,
        leasedCount: leased.length,
        processedCount: 0,
        releasedCount: 0
      };

      for (const message of leased) {
        if (!message.leaseToken) {
          throw new Error(`Leased message ${message.outboxId} is missing a lease token.`);
        }

        if (input.repository.hasProcessedSemanticKey(message.semanticIdempotencyKey)) {
          await input.repository.markPublished({
            leaseToken: message.leaseToken,
            outboxId: message.outboxId,
            publishedAt: input.clock.now()
          });
          summary.deduplicatedCount += 1;
          continue;
        }

        const handler = input.handlers[message.topic];

        try {
          if (!handler) {
            throw new TerminalOutboxError(
              `No outbox handler registered for topic ${message.topic}.`
            );
          }

          await handler(message);
          await input.repository.markPublished({
            leaseToken: message.leaseToken,
            outboxId: message.outboxId,
            publishedAt: input.clock.now()
          });
          summary.processedCount += 1;
        } catch (error) {
          const lastError = error instanceof Error ? error.message : String(error);
          const terminal =
            error instanceof TerminalOutboxError || message.attemptCount >= maxAttempts;

          if (terminal) {
            await input.repository.recordDeadLetter({
              deadLetteredAt: input.clock.now(),
              lastError,
              leaseToken: message.leaseToken,
              outboxId: message.outboxId
            });
            summary.deadLetteredCount += 1;
            continue;
          }

          await input.repository.releaseLease({
            availableAt: coalesceLeaseExpiry(message, input.clock.now()),
            lastError,
            leaseToken: message.leaseToken,
            outboxId: message.outboxId
          });
          summary.releasedCount += 1;
        }
      }

      return summary;
    }
  };
}

function requireLeaseMatch(
  messages: LeasedOutboxMessage[],
  outboxId: string,
  leaseToken: string
): LeasedOutboxMessage {
  const message = messages.find((candidate) => candidate.outboxId === outboxId);

  if (!message || message.leaseToken !== leaseToken) {
    throw new Error(`Lease token mismatch for outbox message ${outboxId}.`);
  }

  return message;
}

function clearLease(message: LeasedOutboxMessage): void {
  message.leaseExpiresAt = null;
  message.leasedAt = null;
  message.leaseToken = null;
}

function coalesceLeaseExpiry(message: LeasedOutboxMessage, fallback: string): string {
  return message.leaseExpiresAt ?? fallback;
}

function cloneLeasedMessage(message: LeasedOutboxMessage): LeasedOutboxMessage {
  return { ...message, payload: { ...message.payload } };
}
