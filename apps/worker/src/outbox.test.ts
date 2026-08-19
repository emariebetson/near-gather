import { describe, expect, it } from "vitest";

import {
  RetriableOutboxError,
  TerminalOutboxError,
  createInMemoryOutboxRepository,
  createManualClock,
  createOutboxConsumer
} from "./index";

describe("@neargather/worker outbox consumer", () => {
  it("retries a leased message after the lease expires and then publishes it", async () => {
    const clock = createManualClock("2026-08-19T12:00:00.000Z");
    const repository = createInMemoryOutboxRepository([
      {
        availableAt: "2026-08-19T12:00:00.000Z",
        eventId: "event-1",
        invitationId: "invitation-1",
        outboxId: "outbox-1",
        payload: { deliveryId: "delivery-1" },
        semanticIdempotencyKey: "delivery:1",
        topic: "delivery.send"
      }
    ]);
    const attempts: string[] = [];
    const consumer = createOutboxConsumer({
      clock,
      handlers: {
        "delivery.send": async () => {
          attempts.push(clock.now());

          if (attempts.length === 1) {
            throw new RetriableOutboxError("provider timeout");
          }
        }
      },
      maxAttempts: 3,
      repository
    });

    await expect(consumer.runOnce({ leaseDurationSeconds: 60, limit: 10 })).resolves
      .toMatchObject({
        deadLetteredCount: 0,
        processedCount: 0,
        releasedCount: 1
      });

    expect(attempts).toEqual(["2026-08-19T12:00:00.000Z"]);
    expect(repository.snapshot().messages[0]).toMatchObject({
      attemptCount: 1,
      lastError: "provider timeout",
      publishedAt: null
    });

    clock.advanceSeconds(61);

    await expect(consumer.runOnce({ leaseDurationSeconds: 60, limit: 10 })).resolves
      .toMatchObject({
        deadLetteredCount: 0,
        processedCount: 1,
        releasedCount: 0
      });

    expect(attempts).toEqual([
      "2026-08-19T12:00:00.000Z",
      "2026-08-19T12:01:01.000Z"
    ]);
    expect(repository.snapshot().messages[0]?.publishedAt).toBe(
      "2026-08-19T12:01:01.000Z"
    );
  });

  it("skips duplicate semantic keys without invoking the handler twice", async () => {
    const clock = createManualClock("2026-08-19T13:00:00.000Z");
    const repository = createInMemoryOutboxRepository([
      {
        availableAt: "2026-08-19T13:00:00.000Z",
        eventId: "event-1",
        invitationId: "invitation-1",
        outboxId: "outbox-1",
        payload: { deliveryId: "delivery-1" },
        semanticIdempotencyKey: "delivery:dedupe",
        topic: "delivery.send"
      },
      {
        availableAt: "2026-08-19T13:00:00.000Z",
        eventId: "event-1",
        invitationId: "invitation-1",
        outboxId: "outbox-2",
        payload: { deliveryId: "delivery-2" },
        semanticIdempotencyKey: "delivery:dedupe",
        topic: "delivery.send"
      }
    ]);
    const deliveries: string[] = [];
    const consumer = createOutboxConsumer({
      clock,
      handlers: {
        "delivery.send": async (message) => {
          deliveries.push(message.outboxId);
        }
      },
      repository
    });

    await expect(consumer.runOnce({ leaseDurationSeconds: 60, limit: 10 })).resolves
      .toMatchObject({
        deduplicatedCount: 1,
        processedCount: 1
      });

    expect(deliveries).toEqual(["outbox-1"]);
    expect(repository.snapshot().processedSemanticKeys).toEqual([
      "delivery:dedupe"
    ]);
    expect(repository.snapshot().messages).toMatchObject([
      { outboxId: "outbox-1", publishedAt: "2026-08-19T13:00:00.000Z" },
      { outboxId: "outbox-2", publishedAt: "2026-08-19T13:00:00.000Z" }
    ]);
  });

  it("routes terminal failures to a dead-letter record", async () => {
    const clock = createManualClock("2026-08-19T14:00:00.000Z");
    const repository = createInMemoryOutboxRepository([
      {
        availableAt: "2026-08-19T14:00:00.000Z",
        eventId: "event-1",
        invitationId: "invitation-1",
        outboxId: "outbox-1",
        payload: { deliveryId: "delivery-1" },
        semanticIdempotencyKey: "delivery:terminal",
        topic: "delivery.send"
      }
    ]);
    const consumer = createOutboxConsumer({
      clock,
      handlers: {
        "delivery.send": async () => {
          throw new TerminalOutboxError("provider rejected destination");
        }
      },
      repository
    });

    await expect(consumer.runOnce({ leaseDurationSeconds: 60, limit: 10 })).resolves
      .toMatchObject({
        deadLetteredCount: 1,
        processedCount: 0
      });

    expect(repository.snapshot().deadLetters).toEqual([
      expect.objectContaining({
        lastError: "provider rejected destination",
        outboxId: "outbox-1",
        semanticIdempotencyKey: "delivery:terminal",
        topic: "delivery.send"
      })
    ]);
  });

  it("processes deletion propagation jobs against object storage", async () => {
    const clock = createManualClock("2026-08-19T15:00:00.000Z");
    const repository = createInMemoryOutboxRepository([
      {
        availableAt: "2026-08-19T15:00:00.000Z",
        eventId: "event-1",
        invitationId: "invitation-1",
        outboxId: "outbox-delete-1",
        payload: {
          deletedObjectKeys: [
            "uploads/media-1/original.jpg",
            "uploads/media-1/derivative-safe.jpg"
          ],
          tombstoneId: "tombstone-1"
        },
        semanticIdempotencyKey: "deletion:tombstone-1",
        topic: "media.deletion.propagate"
      }
    ]);
    const deletedObjectKeys: string[] = [];
    const consumer = createOutboxConsumer({
      clock,
      handlers: {
        "media.deletion.propagate": async (message) => {
          const payload = message.payload as {
            deletedObjectKeys: readonly string[];
          };

          deletedObjectKeys.push(...payload.deletedObjectKeys);
        }
      },
      repository
    });

    await expect(consumer.runOnce({ leaseDurationSeconds: 60, limit: 10 })).resolves
      .toMatchObject({
        processedCount: 1
      });

    expect(deletedObjectKeys).toEqual([
      "uploads/media-1/original.jpg",
      "uploads/media-1/derivative-safe.jpg"
    ]);
  });
});
