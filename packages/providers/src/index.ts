import { createHmac, timingSafeEqual } from "node:crypto";

const TWILIO_PROVIDER_NAME = "TWILIO" as const;
const TWILIO_SIGNATURE_HEADER = "x-twilio-signature" as const;

const STOP_KEYWORDS = new Set([
  "STOP",
  "QUIT",
  "END",
  "REVOKE",
  "OPT OUT",
  "CANCEL",
  "UNSUBSCRIBE"
]);

export type InboundSmsClassification =
  | { kind: "ATTENDANCE"; response: "YES" | "NO" }
  | { kind: "MESSAGING_KEYWORD"; keyword: "STOP" | "START" | "HELP" }
  | { kind: "FREEFORM"; body: string };

export interface TwilioWebhookRequest {
  headers: Readonly<Record<string, string | undefined>>;
  rawBody: string;
  receivedAt: string;
  url: string;
}

export interface NormalizedTwilioInboundMessage {
  body: string;
  classification: InboundSmsClassification;
  from: string;
  providerMessageId: string;
  providerName: typeof TWILIO_PROVIDER_NAME;
  rawParameters: Readonly<Record<string, string>>;
  receivedAt: string;
  semanticIdempotencyKey: string;
  to: string;
}

export interface HandleTwilioInboundWebhookInput {
  authToken: string;
  onVerifiedInbound: (
    message: NormalizedTwilioInboundMessage
  ) => Promise<void> | void;
  request: TwilioWebhookRequest;
}

export type HandleTwilioInboundWebhookResult =
  | { status: "accepted" }
  | { reason: "INVALID_SIGNATURE"; status: "rejected" };

export async function handleTwilioInboundWebhook(
  input: HandleTwilioInboundWebhookInput
): Promise<HandleTwilioInboundWebhookResult> {
  const signature = input.request.headers[TWILIO_SIGNATURE_HEADER];

  if (
    !signature ||
    !verifyTwilioWebhookSignature({
      authToken: input.authToken,
      rawBody: input.request.rawBody,
      signature,
      url: input.request.url
    })
  ) {
    return {
      reason: "INVALID_SIGNATURE",
      status: "rejected"
    };
  }

  const rawParameters = parseTwilioFormBody(input.request.rawBody);
  const providerMessageId =
    rawParameters.MessageSid ??
    rawParameters.SmsSid ??
    rawParameters.SmsMessageSid;
  const from = rawParameters.From;
  const to = rawParameters.To;
  const body = rawParameters.Body ?? "";

  if (!providerMessageId || !from || !to) {
    throw new Error("Twilio inbound webhooks require MessageSid, From, and To.");
  }

  await input.onVerifiedInbound({
    body,
    classification: classifyInboundSmsBody(body),
    from,
    providerMessageId,
    providerName: TWILIO_PROVIDER_NAME,
    rawParameters,
    receivedAt: input.request.receivedAt,
    semanticIdempotencyKey: buildTwilioSemanticIdempotencyKey({
      providerMessageId,
      to
    }),
    to
  });

  return { status: "accepted" };
}

export function classifyInboundSmsBody(body: string): InboundSmsClassification {
  const trimmedBody = body.trim();
  const normalized = trimmedBody.replace(/\s+/g, " ").toUpperCase();

  if (STOP_KEYWORDS.has(normalized)) {
    return { kind: "MESSAGING_KEYWORD", keyword: "STOP" };
  }

  if (normalized === "START") {
    return { kind: "MESSAGING_KEYWORD", keyword: "START" };
  }

  if (normalized === "HELP") {
    return { kind: "MESSAGING_KEYWORD", keyword: "HELP" };
  }

  if (normalized === "YES" || normalized === "NO") {
    return {
      kind: "ATTENDANCE",
      response: normalized
    };
  }

  return {
    body: trimmedBody,
    kind: "FREEFORM"
  };
}

export function buildTwilioSemanticIdempotencyKey(input: {
  providerMessageId: string;
  to: string;
}): string {
  return `twilio:${input.providerMessageId}:${input.to}`;
}

export function verifyTwilioWebhookSignature(input: {
  authToken: string;
  rawBody: string;
  signature: string;
  url: string;
}): boolean {
  const expectedSignature = createTwilioWebhookSignature({
    authToken: input.authToken,
    rawBody: input.rawBody,
    url: input.url
  });

  return signaturesMatch(input.signature, expectedSignature);
}

function createTwilioWebhookSignature(input: {
  authToken: string;
  rawBody: string;
  url: string;
}): string {
  const params = Array.from(new URLSearchParams(input.rawBody).entries()).sort(
    ([left], [right]) => left.localeCompare(right)
  );
  const payload = params.reduce(
    (message, [key, value]) => `${message}${key}${value}`,
    input.url
  );

  return createHmac("sha1", input.authToken).update(payload).digest("base64");
}

function parseTwilioFormBody(rawBody: string): Readonly<Record<string, string>> {
  return Object.freeze(Object.fromEntries(new URLSearchParams(rawBody).entries()));
}

function signaturesMatch(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
