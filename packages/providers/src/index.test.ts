import { createHmac } from "node:crypto";

import { describe, expect, it, vi } from "vitest";

import * as providers from "./index";

interface TwilioWebhookHandler {
  (input: {
    authToken: string;
    onVerifiedInbound: (message: {
      body: string;
      classification:
        | { kind: "ATTENDANCE"; response: "YES" | "NO" }
        | { kind: "MESSAGING_KEYWORD"; keyword: "STOP" | "START" | "HELP" }
        | { kind: "FREEFORM"; body: string };
      from: string;
      providerMessageId: string;
      rawParameters: Readonly<Record<string, string>>;
      receivedAt: string;
      semanticIdempotencyKey: string;
      to: string;
    }) => Promise<void> | void;
    request: {
      headers: Readonly<Record<string, string | undefined>>;
      rawBody: string;
      receivedAt: string;
      url: string;
    };
  }): Promise<{ reason?: "INVALID_SIGNATURE"; status: "accepted" | "rejected" }>;
}

function signTwilioRequest(
  authToken: string,
  url: string,
  rawBody: string
): string {
  const params = Array.from(new URLSearchParams(rawBody).entries()).sort(([left], [right]) =>
    left.localeCompare(right)
  );

  const payload = params.reduce(
    (message, [key, value]) => `${message}${key}${value}`,
    url
  );

  return createHmac("sha1", authToken).update(payload).digest("base64");
}

function getHandler(): TwilioWebhookHandler {
  const handler = (
    providers as unknown as {
      handleTwilioInboundWebhook?: TwilioWebhookHandler;
    }
  ).handleTwilioInboundWebhook;

  expect(handler).toBeTypeOf("function");

  return handler as TwilioWebhookHandler;
}

describe("@neargather/providers Twilio inbound adapter", () => {
  it("rejects an invalid signature and never invokes the verified handler", async () => {
    const handleTwilioInboundWebhook = getHandler();
    const onVerifiedInbound = vi.fn();

    const result = await handleTwilioInboundWebhook({
      authToken: "auth-token",
      onVerifiedInbound,
      request: {
        headers: {
          "x-twilio-signature": "not-a-valid-signature"
        },
        rawBody: "MessageSid=SM123&From=%2B15550001111&To=%2B15550002222&Body=YES",
        receivedAt: "2026-08-19T12:00:00.000Z",
        url: "https://neargather.test/api/providers/twilio/inbound"
      }
    });

    expect(result).toEqual({
      reason: "INVALID_SIGNATURE",
      status: "rejected"
    });
    expect(onVerifiedInbound).not.toHaveBeenCalled();
  });

  it("tolerates unknown Twilio parameters while exposing provider ids and semantic idempotency keys", async () => {
    const handleTwilioInboundWebhook = getHandler();
    const authToken = "auth-token";
    const url = "https://neargather.test/api/providers/twilio/inbound";
    const rawBody =
      "MessageSid=SM456&From=%2B15550001111&To=%2B15550002222&Body=We+will+be+there&ProfileName=Pat&WaId=123456";
    const inboundMessages: Array<{
      body: string;
      classification: { kind: string };
      from: string;
      providerMessageId: string;
      rawParameters: Readonly<Record<string, string>>;
      receivedAt: string;
      semanticIdempotencyKey: string;
      to: string;
    }> = [];

    const result = await handleTwilioInboundWebhook({
      authToken,
      onVerifiedInbound: (message) => {
        inboundMessages.push(message);
      },
      request: {
        headers: {
          "x-twilio-signature": signTwilioRequest(authToken, url, rawBody)
        },
        rawBody,
        receivedAt: "2026-08-19T12:05:00.000Z",
        url
      }
    });

    expect(result).toEqual({ status: "accepted" });
    expect(inboundMessages).toHaveLength(1);
    expect(inboundMessages[0]).toMatchObject({
      body: "We will be there",
      classification: { kind: "FREEFORM" },
      from: "+15550001111",
      providerMessageId: "SM456",
      rawParameters: {
        Body: "We will be there",
        From: "+15550001111",
        MessageSid: "SM456",
        ProfileName: "Pat",
        To: "+15550002222",
        WaId: "123456"
      },
      receivedAt: "2026-08-19T12:05:00.000Z",
      semanticIdempotencyKey: "twilio:SM456:+15550002222",
      to: "+15550002222"
    });
  });

  it("classifies STOP separately from RSVP NO", async () => {
    const handleTwilioInboundWebhook = getHandler();
    const authToken = "auth-token";
    const url = "https://neargather.test/api/providers/twilio/inbound";

    async function captureClassification(body: string) {
      let classification:
        | { kind: "ATTENDANCE"; response: "YES" | "NO" }
        | { kind: "MESSAGING_KEYWORD"; keyword: "STOP" | "START" | "HELP" }
        | { kind: "FREEFORM"; body: string }
        | undefined;

      const rawBody = `MessageSid=SM-${body}&From=%2B15550001111&To=%2B15550002222&Body=${body}`;

      await handleTwilioInboundWebhook({
        authToken,
        onVerifiedInbound: (message) => {
          classification = message.classification;
        },
        request: {
          headers: {
            "x-twilio-signature": signTwilioRequest(authToken, url, rawBody)
          },
          rawBody,
          receivedAt: "2026-08-19T12:10:00.000Z",
          url
        }
      });

      expect(classification).toBeDefined();
      return classification;
    }

    await expect(captureClassification("STOP")).resolves.toEqual({
      kind: "MESSAGING_KEYWORD",
      keyword: "STOP"
    });
    await expect(captureClassification("NO")).resolves.toEqual({
      kind: "ATTENDANCE",
      response: "NO"
    });
  });
});
