import { describe, expect, it } from "vitest";

import {
  createInMemoryMediaRepository,
  createInMemoryObjectStorage,
  createManualClock,
  createMediaLifecycleService,
  createStubScanner,
  createStubTranscoder
} from "./index";

describe("@neargather/providers media lifecycle", () => {
  it("reissues a short-lived single-object upload grant after an interrupted upload", async () => {
    const clock = createManualClock("2026-08-19T16:00:00.000Z");
    const repository = createInMemoryMediaRepository();
    const service = createMediaLifecycleService({
      clock,
      objectStorage: createInMemoryObjectStorage(),
      repository,
      scanner: createStubScanner(),
      transcoder: createStubTranscoder()
    });

    const initialGrant = await service.issueUploadGrant({
      checksumSha256: "checksum-1",
      contentType: "image/jpeg",
      eventId: "event-1",
      invitationId: "invitation-1",
      mediaId: "media-1",
      objectKey: "uploads/media-1/original.jpg",
      sizeBytes: 512
    });

    clock.advanceSeconds(301);

    const retryGrant = await service.issueUploadGrant({
      checksumSha256: "checksum-1",
      contentType: "image/jpeg",
      eventId: "event-1",
      invitationId: "invitation-1",
      mediaId: "media-1",
      objectKey: "uploads/media-1/original.jpg",
      sizeBytes: 512
    });

    expect(initialGrant.objectKey).toBe("uploads/media-1/original.jpg");
    expect(retryGrant.objectKey).toBe("uploads/media-1/original.jpg");
    expect(initialGrant.expiresAt).toBe("2026-08-19T16:05:00.000Z");
    expect(retryGrant.expiresAt).toBe("2026-08-19T16:10:01.000Z");
    expect(retryGrant.expiresAt).not.toBe(initialGrant.expiresAt);
    expect(retryGrant.singleUseToken).not.toBe(initialGrant.singleUseToken);
    expect(repository.get("media-1")).toMatchObject({
      mediaId: "media-1",
      objectKey: "uploads/media-1/original.jpg",
      status: "UPLOADING"
    });
  });

  it("rejects finalization when the uploaded checksum does not match the grant", async () => {
    const clock = createManualClock("2026-08-19T17:00:00.000Z");
    const objectStorage = createInMemoryObjectStorage();
    const repository = createInMemoryMediaRepository();
    const service = createMediaLifecycleService({
      clock,
      objectStorage,
      repository,
      scanner: createStubScanner(),
      transcoder: createStubTranscoder()
    });

    await service.issueUploadGrant({
      checksumSha256: "checksum-expected",
      contentType: "image/jpeg",
      eventId: "event-1",
      invitationId: "invitation-1",
      mediaId: "media-1",
      objectKey: "uploads/media-1/original.jpg",
      sizeBytes: 512
    });

    objectStorage.putObject({
      checksumSha256: "checksum-actual",
      contentType: "image/jpeg",
      objectKey: "uploads/media-1/original.jpg",
      sizeBytes: 512
    });

    await expect(
      service.finalizeUpload({
        mediaId: "media-1",
        objectKey: "uploads/media-1/original.jpg"
      })
    ).resolves.toMatchObject({
      reason: "CHECKSUM_MISMATCH",
      status: "REJECTED"
    });

    expect(repository.get("media-1")).toMatchObject({
      rejectionReason: "CHECKSUM_MISMATCH",
      status: "REJECTED"
    });
  });

  it("refuses replacement after a media upload has already been accepted", async () => {
    const clock = createManualClock("2026-08-19T18:00:00.000Z");
    const objectStorage = createInMemoryObjectStorage();
    const repository = createInMemoryMediaRepository();
    const service = createMediaLifecycleService({
      clock,
      objectStorage,
      repository,
      scanner: createStubScanner(),
      transcoder: createStubTranscoder()
    });

    await service.issueUploadGrant({
      checksumSha256: "checksum-1",
      contentType: "image/jpeg",
      eventId: "event-1",
      invitationId: "invitation-1",
      mediaId: "media-1",
      objectKey: "uploads/media-1/original.jpg",
      sizeBytes: 512
    });
    objectStorage.putObject({
      checksumSha256: "checksum-1",
      contentType: "image/jpeg",
      objectKey: "uploads/media-1/original.jpg",
      sizeBytes: 512
    });

    await expect(
      service.finalizeUpload({
        mediaId: "media-1",
        objectKey: "uploads/media-1/original.jpg"
      })
    ).resolves.toMatchObject({
      qualifiesForRsvp: true,
      status: "READY"
    });

    await expect(
      service.issueUploadGrant({
        checksumSha256: "checksum-2",
        contentType: "image/png",
        eventId: "event-1",
        invitationId: "invitation-1",
        mediaId: "media-1",
        objectKey: "uploads/media-1/replacement.png",
        sizeBytes: 1024
      })
    ).rejects.toThrow("Accepted media cannot be replaced.");
  });

  it("stays quarantined until a durable safe derivative exists and finalization is idempotent on retry", async () => {
    const clock = createManualClock("2026-08-19T19:00:00.000Z");
    const objectStorage = createInMemoryObjectStorage();
    const repository = createInMemoryMediaRepository();
    const transcoder = createStubTranscoder({
      nextDerivativeStates: [
        {
          derivativeKey: "uploads/media-1/derivative-safe.jpg",
          durable: false,
          supported: true
        },
        {
          derivativeKey: "uploads/media-1/derivative-safe.jpg",
          durable: true,
          supported: true
        }
      ]
    });
    const service = createMediaLifecycleService({
      clock,
      objectStorage,
      repository,
      scanner: createStubScanner(),
      transcoder
    });

    await service.issueUploadGrant({
      checksumSha256: "checksum-1",
      contentType: "image/jpeg",
      eventId: "event-1",
      invitationId: "invitation-1",
      mediaId: "media-1",
      objectKey: "uploads/media-1/original.jpg",
      sizeBytes: 512
    });
    objectStorage.putObject({
      checksumSha256: "checksum-1",
      contentType: "image/jpeg",
      objectKey: "uploads/media-1/original.jpg",
      sizeBytes: 512
    });

    await expect(
      service.finalizeUpload({
        mediaId: "media-1",
        objectKey: "uploads/media-1/original.jpg"
      })
    ).resolves.toMatchObject({
      qualifiesForRsvp: false,
      status: "QUARANTINED"
    });

    expect(repository.get("media-1")).toMatchObject({
      derivativeKey: "uploads/media-1/derivative-safe.jpg",
      status: "QUARANTINED"
    });

    await expect(
      service.finalizeUpload({
        mediaId: "media-1",
        objectKey: "uploads/media-1/original.jpg"
      })
    ).resolves.toMatchObject({
      qualifiesForRsvp: true,
      status: "READY"
    });

    await expect(
      service.finalizeUpload({
        mediaId: "media-1",
        objectKey: "uploads/media-1/original.jpg"
      })
    ).resolves.toMatchObject({
      qualifiesForRsvp: true,
      status: "READY"
    });
  });
});
