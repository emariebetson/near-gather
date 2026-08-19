import { describe, expect, it } from "vitest";

import {
  CapabilityPurpose,
  hashCapabilityToken,
  pilotProgramMetadata,
  signCapabilityToken,
  verifyCapabilityToken
} from "./index";

describe("capability token helpers", () => {
  it("hashes raw tokens and signs purpose-scoped capabilities without embedding the raw token", () => {
    const rawToken = "rsvp:adult@example.com:+15551234567";
    const secret = "super-secret";

    const tokenHash = hashCapabilityToken(rawToken);
    const token = signCapabilityToken({
      eventId: "evt_1",
      expiresAt: "2026-08-20T00:00:00.000Z",
      invitationId: "inv_1",
      issuedAt: "2026-08-19T00:00:00.000Z",
      purpose: CapabilityPurpose.INVITATION_RSVP,
      rawToken,
      secret
    });

    expect(tokenHash).not.toBe(rawToken);
    expect(token).not.toContain(rawToken);
    expect(token).not.toContain("adult@example.com");
    expect(token).not.toContain("5551234567");

    expect(
      verifyCapabilityToken({
        now: "2026-08-19T12:00:00.000Z",
        purpose: CapabilityPurpose.INVITATION_RSVP,
        secret,
        token
      })
    ).toMatchObject({
      eventId: "evt_1",
      invitationId: "inv_1",
      purpose: CapabilityPurpose.INVITATION_RSVP,
      tokenHash
    });
  });

  it("rejects capability tokens with the wrong purpose, tampering, or expiry", () => {
    const token = signCapabilityToken({
      eventId: "evt_1",
      expiresAt: "2026-08-20T00:00:00.000Z",
      invitationId: "inv_1",
      issuedAt: "2026-08-19T00:00:00.000Z",
      purpose: CapabilityPurpose.MEDIA_UPLOAD,
      rawToken: "opaque-upload-token",
      secret: "super-secret"
    });

    expect(
      verifyCapabilityToken({
        now: "2026-08-19T12:00:00.000Z",
        purpose: CapabilityPurpose.INVITATION_RSVP,
        secret: "super-secret",
        token
      })
    ).toBeNull();

    expect(
      verifyCapabilityToken({
        now: "2026-08-21T00:00:00.000Z",
        purpose: CapabilityPurpose.MEDIA_UPLOAD,
        secret: "super-secret",
        token
      })
    ).toBeNull();

    expect(
      verifyCapabilityToken({
        now: "2026-08-19T12:00:00.000Z",
        purpose: CapabilityPurpose.MEDIA_UPLOAD,
        secret: "super-secret",
        token: `${token}x`
      })
    ).toBeNull();

    expect(
      verifyCapabilityToken({
        now: "2026-08-19T12:00:00.000Z",
        purpose: CapabilityPurpose.MEDIA_UPLOAD,
        secret: "super-secret",
        token: `${token}.extra`
      })
    ).toBeNull();
  });

  it("exports the canonical 30-event pilot composition for birthdays, including shared and milestone coverage", () => {
    expect(pilotProgramMetadata).toMatchObject({
      birthday: {
        adultHonoreePairs: 2,
        invitedGuestMinimum: 10,
        minorHonoreePairs: 3,
        pairCount: 5,
        requiredFormats: ["SHARED", "MILESTONE"]
      },
      matchedPairs: 15,
      totalEvents: 30
    });
  });
});
