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
  rawParameterEntries: readonly { key: string; value: string }[];
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
  const parsedBody = parseTwilioFormBody(input.request.rawBody);
  const signature = input.request.headers[TWILIO_SIGNATURE_HEADER];

  if (
    !parsedBody ||
    !signature ||
    !verifyTwilioWebhookSignature({
      authToken: input.authToken,
      parsedBody,
      signature,
      url: input.request.url
    })
  ) {
    return {
      reason: "INVALID_SIGNATURE",
      status: "rejected"
    };
  }

  const rawParameters = toTwilioParameterRecord(parsedBody);
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
    rawParameterEntries: parsedBody,
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
  parsedBody: readonly { key: string; value: string }[];
  signature: string;
  url: string;
}): boolean {
  const expectedSignature = createTwilioWebhookSignature({
    authToken: input.authToken,
    parsedBody: input.parsedBody,
    url: input.url
  });

  return signaturesMatch(input.signature, expectedSignature);
}

function createTwilioWebhookSignature(input: {
  authToken: string;
  parsedBody: readonly { key: string; value: string }[];
  url: string;
}): string {
  const normalizedUrl = normalizeTwilioUrl(input.url);
  const params = [...input.parsedBody].sort((left, right) =>
    left.key === right.key
      ? left.value.localeCompare(right.value)
      : left.key.localeCompare(right.key)
  );
  const payload = params.reduce(
    (message, entry) => `${message}${entry.key}${entry.value}`,
    normalizedUrl
  );

  return createHmac("sha1", input.authToken).update(payload).digest("base64");
}

function parseTwilioFormBody(
  rawBody: string
): readonly { key: string; value: string }[] | null {
  try {
    return Object.freeze(
      rawBody
        .split("&")
        .filter((entry) => entry.length > 0)
        .map((entry) => {
          const separatorIndex = entry.indexOf("=");
          const rawKey = separatorIndex >= 0 ? entry.slice(0, separatorIndex) : entry;
          const rawValue = separatorIndex >= 0 ? entry.slice(separatorIndex + 1) : "";

          return {
            key: decodeURIComponent(rawKey.replace(/\+/g, " ")),
            value: decodeURIComponent(rawValue.replace(/\+/g, " "))
          };
        })
    );
  } catch {
    return null;
  }
}

function toTwilioParameterRecord(
  entries: readonly { key: string; value: string }[]
): Readonly<Record<string, string>> {
  return Object.freeze(
    entries.reduce<Record<string, string>>((accumulator, entry) => {
      accumulator[entry.key] = entry.value;
      return accumulator;
    }, {})
  );
}

function normalizeTwilioUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    return `${parsedUrl.origin}${parsedUrl.pathname}${parsedUrl.search}`;
  } catch {
    return url;
  }
}

function signaturesMatch(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
