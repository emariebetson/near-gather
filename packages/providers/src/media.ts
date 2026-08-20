import { randomBytes } from "node:crypto";

export interface Clock {
  now(): string;
}

export interface ManualClock extends Clock {
  advanceSeconds(seconds: number): void;
}

export type MediaStatus =
  | "UPLOADING"
  | "QUARANTINED"
  | "READY"
  | "REJECTED"
  | "DELETED";

export type MediaRejectionReason =
  | "CHECKSUM_MISMATCH"
  | "CONTENT_TYPE_MISMATCH"
  | "DECLARED_TYPE_MISMATCH"
  | "FINALIZE_TOKEN_EXPIRED"
  | "FINALIZE_TOKEN_REPLAY"
  | "FINALIZE_TOKEN_REQUIRED"
  | "FINALIZE_TOKEN_SCOPE_MISMATCH"
  | "MAX_SIZE_EXCEEDED"
  | "MALWARE_DETECTED"
  | "MISSING_OBJECT"
  | "SIZE_MISMATCH"
  | "UNSUPPORTED_CODEC"
  | "ZERO_BYTE_OBJECT";

export interface MediaRecord {
  acceptedAt: string | null;
  checksumSha256: string;
  contentType: string;
  derivativeKey: string | null;
  eventId: string;
  finalizationFingerprint: string | null;
  grantExpiresAt: string;
  invitationId: string;
  mediaId: string;
  objectKey: string;
  replayedFinalizeTokenIds: readonly string[];
  rejectionReason: MediaRejectionReason | null;
  singleUseToken: string;
  sizeBytes: number;
  status: MediaStatus;
  tokenConsumedAt: string | null;
}

export interface StoredObject {
  checksumSha256: string;
  contentType: string;
  objectKey: string;
  sizeBytes: number;
}

export interface ObjectStoragePort {
  headObject(objectKey: string): Promise<StoredObject | null> | StoredObject | null;
}

export interface PrivateObjectStoragePort extends ObjectStoragePort {
  createPresignedPut(input: {
    checksumSha256: string;
    contentType: string;
    expiresAt: string;
    maxBytes: number;
    objectKey: string;
  }): Promise<string> | string;
  deleteObject(objectKey: string): Promise<void> | void;
}

export interface ScannerPort {
  scan(input: {
    checksumSha256: string;
    objectKey: string;
  }): Promise<{ reason?: string; safe: boolean }> | { reason?: string; safe: boolean };
}

export interface ByteSignatureValidationPort {
  validate(input: {
    contentType: string;
    objectKey: string;
  }):
    | Promise<{
        matchesDeclaredType: boolean;
        supported: boolean;
      }>
    | {
        matchesDeclaredType: boolean;
        supported: boolean;
      };
}

export interface TranscoderPort {
  createSafeDerivative(input: {
    contentType: string;
    objectKey: string;
  }):
    | Promise<{
        derivativeKey: string;
        durable: boolean;
        supported: boolean;
      }>
    | {
        derivativeKey: string;
        durable: boolean;
        supported: boolean;
      };
}

export interface MediaRepository {
  get(mediaId: string): MediaRecord | undefined;
  save(record: MediaRecord): Promise<void> | void;
}

export interface IssueUploadGrantInput {
  checksumSha256: string;
  contentType: string;
  eventId: string;
  invitationId: string;
  mediaId: string;
  objectKey: string;
  sizeBytes: number;
}

export interface UploadGrant {
  expiresAt: string;
  objectKey: string;
  singleUseToken: string;
  uploadUrl: string;
}

export type FinalizeUploadResult =
  | {
      derivativeKey: string;
      qualifiesForRsvp: boolean;
      status: "QUARANTINED";
    }
  | {
      derivativeKey: string;
      qualifiesForRsvp: true;
      status: "READY";
    }
  | {
      qualifiesForRsvp: false;
      reason: MediaRejectionReason;
      status: "REJECTED";
    };

export interface CreateMediaLifecycleServiceInput {
  byteSignatureValidator: ByteSignatureValidationPort;
  clock: Clock;
  maxUploadBytes: number;
  objectStorage: ObjectStoragePort;
  repository: MediaRepository;
  scanner: ScannerPort;
  transcoder: TranscoderPort;
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

export function createInMemoryObjectStorage(): ObjectStoragePort & {
  putObject(object: StoredObject): void;
} {
  const objects = new Map<string, StoredObject>();

  return {
    headObject(objectKey) {
      const object = objects.get(objectKey);
      return object ? { ...object } : null;
    },
    putObject(object) {
      objects.set(object.objectKey, { ...object });
    }
  };
}

export function createInMemoryMediaRepository(): MediaRepository {
  const records = new Map<string, MediaRecord>();

  return {
    get(mediaId) {
      const record = records.get(mediaId);
      return record ? { ...record } : undefined;
    },
    save(record) {
      records.set(record.mediaId, { ...record });
    }
  };
}

export function createStubScanner(result?: {
  reason?: string;
  safe: boolean;
}): ScannerPort {
  return {
    scan() {
      return result ?? { safe: true };
    }
  };
}

export function createStubByteSignatureValidator(input?: {
  nextResults?: readonly {
    matchesDeclaredType: boolean;
    supported: boolean;
  }[];
}): ByteSignatureValidationPort {
  const queuedResults = [...(input?.nextResults ?? [])];

  return {
    validate() {
      return queuedResults.shift() ?? { matchesDeclaredType: true, supported: true };
    }
  };
}

export function createStubTranscoder(input?: {
  nextDerivativeStates?: readonly {
    derivativeKey: string;
    durable: boolean;
    supported: boolean;
  }[];
}): TranscoderPort {
  const queuedStates = [...(input?.nextDerivativeStates ?? [])];

  return {
    createSafeDerivative({ objectKey }) {
      const next = queuedStates.shift();

      if (next) {
        return next;
      }

      return {
        derivativeKey: buildDerivativeKey(objectKey),
        durable: true,
        supported: true
      };
    }
  };
}

export function createMediaLifecycleService(input: CreateMediaLifecycleServiceInput): {
  finalizeUpload(args: {
    eventId: string;
    invitationId: string;
    mediaId: string;
    objectKey: string;
    singleUseToken: string;
  }): Promise<FinalizeUploadResult>;
  issueUploadGrant(args: IssueUploadGrantInput): Promise<UploadGrant>;
} {
  return {
    async finalizeUpload(args) {
      const existing = input.repository.get(args.mediaId);

      if (!existing) {
        throw new Error(`Unknown media upload ${args.mediaId}.`);
      }

      if (existing.objectKey !== args.objectKey) {
        throw new Error("Upload finalization is single-object scoped.");
      }

      if (args.singleUseToken.length === 0) {
        return rejectUpload(input.repository, existing, "FINALIZE_TOKEN_REQUIRED");
      }

      if (
        existing.eventId !== args.eventId ||
        existing.invitationId !== args.invitationId ||
        existing.singleUseToken !== args.singleUseToken
      ) {
        return rejectUpload(input.repository, existing, "FINALIZE_TOKEN_SCOPE_MISMATCH");
      }

      if (new Date(input.clock.now()).valueOf() > new Date(existing.grantExpiresAt).valueOf()) {
        return rejectUpload(input.repository, existing, "FINALIZE_TOKEN_EXPIRED");
      }

      if (existing.tokenConsumedAt) {
        const replayRecord: MediaRecord = {
          ...existing,
          replayedFinalizeTokenIds: [
            ...existing.replayedFinalizeTokenIds,
            args.singleUseToken
          ]
        };
        await input.repository.save(replayRecord);
        return rejectUpload(input.repository, replayRecord, "FINALIZE_TOKEN_REPLAY");
      }

      if (existing.status === "REJECTED") {
        return {
          qualifiesForRsvp: false,
          reason: existing.rejectionReason ?? "MISSING_OBJECT",
          status: "REJECTED"
        };
      }

      const storedObject = await input.objectStorage.headObject(existing.objectKey);

      if (!storedObject) {
        return rejectUpload(input.repository, existing, "MISSING_OBJECT");
      }

      if (storedObject.sizeBytes === 0) {
        return rejectUpload(input.repository, existing, "ZERO_BYTE_OBJECT");
      }

      if (storedObject.sizeBytes > input.maxUploadBytes) {
        return rejectUpload(input.repository, existing, "MAX_SIZE_EXCEEDED");
      }

      if (storedObject.sizeBytes !== existing.sizeBytes) {
        return rejectUpload(input.repository, existing, "SIZE_MISMATCH");
      }

      if (storedObject.contentType !== existing.contentType) {
        return rejectUpload(input.repository, existing, "CONTENT_TYPE_MISMATCH");
      }

      if (storedObject.checksumSha256 !== existing.checksumSha256) {
        return rejectUpload(input.repository, existing, "CHECKSUM_MISMATCH");
      }

      const byteSignature = await input.byteSignatureValidator.validate({
        contentType: storedObject.contentType,
        objectKey: storedObject.objectKey
      });

      if (!byteSignature.matchesDeclaredType) {
        return rejectUpload(input.repository, existing, "DECLARED_TYPE_MISMATCH");
      }

      if (!byteSignature.supported) {
        return rejectUpload(input.repository, existing, "UNSUPPORTED_CODEC");
      }

      const quarantinedRecord: MediaRecord = {
        ...existing,
        status: "QUARANTINED"
      };
      await input.repository.save(quarantinedRecord);

      const scanResult = await input.scanner.scan({
        checksumSha256: storedObject.checksumSha256,
        objectKey: storedObject.objectKey
      });

      if (!scanResult.safe) {
        return rejectUpload(input.repository, quarantinedRecord, "MALWARE_DETECTED");
      }

      const derivative = await input.transcoder.createSafeDerivative({
        contentType: storedObject.contentType,
        objectKey: storedObject.objectKey
      });

      if (!derivative.supported) {
        return rejectUpload(input.repository, quarantinedRecord, "UNSUPPORTED_CODEC");
      }

      if (!derivative.durable) {
        await input.repository.save({
          ...quarantinedRecord,
          derivativeKey: derivative.derivativeKey
        });
        return {
          derivativeKey: derivative.derivativeKey,
          qualifiesForRsvp: false,
          status: "QUARANTINED"
        };
      }

      const acceptedAt = input.clock.now();
      await input.repository.save({
        ...quarantinedRecord,
        acceptedAt,
        derivativeKey: derivative.derivativeKey,
        finalizationFingerprint: buildFinalizationFingerprint(storedObject),
        rejectionReason: null,
        status: "READY",
        tokenConsumedAt: acceptedAt
      });

      return {
        derivativeKey: derivative.derivativeKey,
        qualifiesForRsvp: true,
        status: "READY"
      };
    },
    async issueUploadGrant(args) {
      const current = input.repository.get(args.mediaId);

      if (current?.status === "READY") {
        throw new Error("Accepted media cannot be replaced.");
      }

      if (current && current.objectKey !== args.objectKey) {
        throw new Error("Upload grants are single-object scoped.");
      }

      if (
        current &&
        (current.eventId !== args.eventId ||
          current.invitationId !== args.invitationId ||
          current.checksumSha256 !== args.checksumSha256 ||
          current.contentType !== args.contentType ||
          current.sizeBytes !== args.sizeBytes ||
          current.objectKey !== args.objectKey)
      ) {
        throw new Error("Reissued upload grants must preserve the original upload scope.");
      }

      const issuedAt = new Date(input.clock.now()).valueOf();
      const expiresAt = new Date(issuedAt + 5 * 60 * 1000).toISOString();
      const nextRecord: MediaRecord = {
        acceptedAt: current?.acceptedAt ?? null,
        checksumSha256: args.checksumSha256,
        contentType: args.contentType,
        derivativeKey: current?.derivativeKey ?? null,
        eventId: args.eventId,
        finalizationFingerprint: current?.finalizationFingerprint ?? null,
        grantExpiresAt: expiresAt,
        invitationId: args.invitationId,
        mediaId: args.mediaId,
        objectKey: args.objectKey,
        replayedFinalizeTokenIds: current?.replayedFinalizeTokenIds ?? [],
        rejectionReason: current?.rejectionReason ?? null,
        singleUseToken: randomBytes(24).toString("hex"),
        sizeBytes: args.sizeBytes,
        status: current?.status === "QUARANTINED" ? "QUARANTINED" : "UPLOADING",
        tokenConsumedAt: null
      };

      await input.repository.save(nextRecord);

      return {
        expiresAt,
        objectKey: args.objectKey,
        singleUseToken: nextRecord.singleUseToken,
        uploadUrl: `memory://${args.objectKey}?token=${nextRecord.singleUseToken}`
      };
    }
  };
}

function buildDerivativeKey(objectKey: string): string {
  const lastSlash = objectKey.lastIndexOf("/");
  const directory = lastSlash >= 0 ? objectKey.slice(0, lastSlash) : "";
  const extensionIndex = objectKey.lastIndexOf(".");
  const extension = extensionIndex >= 0 ? objectKey.slice(extensionIndex) : "";

  return `${directory}/derivative-safe${extension}`;
}

function buildFinalizationFingerprint(object: StoredObject): string {
  return `${object.sizeBytes}:${object.contentType}:${object.checksumSha256}`;
}

async function rejectUpload(
  repository: MediaRepository,
  record: MediaRecord,
  reason: MediaRejectionReason
): Promise<FinalizeUploadResult> {
  await repository.save({
    ...record,
    rejectionReason: reason,
    status: "REJECTED"
  });

  return {
    qualifiesForRsvp: false,
    reason,
    status: "REJECTED"
  };
}
