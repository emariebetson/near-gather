import {
  BirthdayFormat,
  EventType,
  RSVPState,
  type AdultActorAssurance,
  type ConsentGrant,
  type DataRightsRequest,
  type GuardianAuthorityRecord,
  type MediaLicenseReceipt,
  type MessagingSuppression,
  type OnBehalfDisclosureReceipt,
  type OptOutEvent,
  type ProcessingNoticeReceipt
} from "@neargather/contracts";
import type { InvitationState, OrganizerExemption } from "@neargather/domain";

export const INITIAL_MIGRATION_ID = "0001_initial" as const;

export const INITIAL_MIGRATION_SQL = String.raw`create schema if not exists neargather;

create type neargather.event_type as enum ('WEDDING', 'BABY_SHOWER', 'BIRTHDAY');
create type neargather.birthday_format as enum ('STANDARD', 'MILESTONE', 'SHARED');
create type neargather.rsvp_state as enum (
  'AWAITING_RESPONSE',
  'DECLINED',
  'ATTENDING_INCOMPLETE',
  'ATTENDING_COMPLETE',
  'EXEMPT_INCOMPLETE',
  'EXEMPT_COMPLETE'
);

create table neargather.accepted_contributions (
  event_id text not null,
  invitation_id text not null,
  contribution_id text not null,
  contribution_kind text not null,
  accepted_at timestamptz not null,
  primary key (event_id, invitation_id, contribution_id)
);

create table neargather.organizer_exemption_audits (
  event_id text not null,
  invitation_id text not null,
  audit_id text not null,
  granted_by_actor_id text not null,
  reason text not null,
  granted_at timestamptz not null,
  primary key (event_id, invitation_id, audit_id),
  check (length(trim(reason)) > 0)
);

create table neargather.invitation_states (
  event_id text not null,
  invitation_id text not null,
  event_type neargather.event_type not null,
  birthday_format neargather.birthday_format,
  version integer not null,
  rsvp_state neargather.rsvp_state not null,
  attendance_response text,
  answers_complete boolean not null default false,
  qualifying_contribution_id text,
  organizer_exemption_audit_id text,
  rsvp_gate_prompt_accepted_at timestamptz,
  state_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (event_id, invitation_id),
  check (
    (event_type = 'BIRTHDAY' and birthday_format is not null)
    or (event_type <> 'BIRTHDAY' and birthday_format is null)
  ),
  check (
    rsvp_state not in ('ATTENDING_INCOMPLETE', 'ATTENDING_COMPLETE')
    or (
      qualifying_contribution_id is not null
      and rsvp_gate_prompt_accepted_at is not null
    )
  ),
  check (
    rsvp_state not in ('EXEMPT_INCOMPLETE', 'EXEMPT_COMPLETE')
    or organizer_exemption_audit_id is not null
  ),
  foreign key (event_id, invitation_id, qualifying_contribution_id)
    references neargather.accepted_contributions (event_id, invitation_id, contribution_id),
  foreign key (event_id, invitation_id, organizer_exemption_audit_id)
    references neargather.organizer_exemption_audits (event_id, invitation_id, audit_id)
);

create table neargather.invitation_state_history (
  event_id text not null,
  invitation_id text not null,
  state_version integer not null,
  semantic_idempotency_key text not null unique,
  rsvp_state neargather.rsvp_state not null,
  snapshot_json jsonb not null,
  recorded_at timestamptz not null,
  primary key (event_id, invitation_id, state_version),
  foreign key (event_id, invitation_id)
    references neargather.invitation_states (event_id, invitation_id)
);

create table neargather.adult_actor_assurance_receipts (
  event_id text not null,
  invitation_id text not null,
  receipt_id text not null,
  actor_id text not null,
  role text not null,
  assurance_version text not null,
  channel text not null,
  evidence text not null,
  recorded_at timestamptz not null,
  primary key (event_id, invitation_id, receipt_id),
  foreign key (event_id, invitation_id)
    references neargather.invitation_states (event_id, invitation_id)
);

create table neargather.guardian_authority_records (
  event_id text not null,
  invitation_id text not null,
  receipt_id text not null,
  minor_honoree_id text not null,
  guardian_adult_actor_id text not null,
  authority_scope text not null,
  authority_version text not null,
  child_relationship text,
  disclosure_accepted boolean not null,
  notice_version text not null,
  recorded_at timestamptz not null,
  primary key (event_id, invitation_id, receipt_id),
  foreign key (event_id, invitation_id)
    references neargather.invitation_states (event_id, invitation_id)
);

create table neargather.on_behalf_disclosure_receipts (
  event_id text not null,
  invitation_id text not null,
  receipt_id text not null,
  actor_id text not null,
  minor_honoree_id text not null,
  disclosure_version text not null,
  scope text not null,
  recorded_at timestamptz not null,
  primary key (event_id, invitation_id, receipt_id),
  foreign key (event_id, invitation_id)
    references neargather.invitation_states (event_id, invitation_id)
);

create table neargather.processing_notice_receipts (
  event_id text not null,
  invitation_id text not null,
  receipt_id text not null,
  actor_id text not null,
  notice_version text not null,
  purpose text not null,
  audience text not null,
  channel text not null,
  categories jsonb not null,
  retention_until timestamptz not null,
  recorded_at timestamptz not null,
  primary key (event_id, invitation_id, receipt_id),
  foreign key (event_id, invitation_id)
    references neargather.invitation_states (event_id, invitation_id)
);

create table neargather.consent_grants (
  event_id text not null,
  invitation_id text not null,
  grant_id text not null,
  actor_id text not null,
  purpose text not null,
  granted_at timestamptz not null,
  withdrawn_at timestamptz,
  primary key (event_id, invitation_id, grant_id),
  foreign key (event_id, invitation_id)
    references neargather.invitation_states (event_id, invitation_id)
);

create table neargather.media_license_receipts (
  event_id text not null,
  invitation_id text not null,
  license_id text not null,
  actor_id text not null,
  audience text not null,
  licensed_at timestamptz not null,
  primary key (event_id, invitation_id, license_id),
  foreign key (event_id, invitation_id)
    references neargather.invitation_states (event_id, invitation_id)
);

create table neargather.opt_out_events (
  event_id text not null,
  invitation_id text not null,
  opt_out_event_id bigserial primary key,
  keyword text not null,
  raw_input text not null,
  occurred_at timestamptz not null,
  semantic_idempotency_key text not null unique,
  foreign key (event_id, invitation_id)
    references neargather.invitation_states (event_id, invitation_id)
);

create table neargather.messaging_suppressions (
  event_id text not null,
  invitation_id text not null,
  suppression_id text not null,
  hashed_destination text not null,
  scope text not null,
  reason text not null,
  suppressed_at timestamptz not null,
  propagated_at timestamptz,
  primary key (event_id, invitation_id, suppression_id),
  unique (event_id, hashed_destination, scope),
  foreign key (event_id, invitation_id)
    references neargather.invitation_states (event_id, invitation_id)
);

create table neargather.data_rights_requests (
  event_id text not null,
  invitation_id text not null,
  request_id text not null,
  requester_type text not null,
  status text not null,
  authenticated_actor_id text,
  target_id text,
  submitted_at timestamptz not null,
  tombstoned_at timestamptz,
  primary_erasure_due_at timestamptz,
  processor_erasure_due_at timestamptz,
  backup_expiry_at timestamptz,
  primary key (event_id, invitation_id, request_id),
  foreign key (event_id, invitation_id)
    references neargather.invitation_states (event_id, invitation_id)
);

create table neargather.provider_inbound_messages (
  provider_inbound_message_id text primary key,
  provider_name text not null,
  provider_message_id text not null unique,
  event_id text not null,
  invitation_id text,
  semantic_idempotency_key text not null unique,
  raw_receipt jsonb not null,
  processing_status text not null,
  received_at timestamptz not null,
  foreign key (event_id, invitation_id)
    references neargather.invitation_states (event_id, invitation_id)
);

create table neargather.transactional_outbox (
  outbox_id text primary key,
  event_id text not null,
  invitation_id text,
  topic text not null,
  payload jsonb not null,
  semantic_idempotency_key text not null unique,
  available_at timestamptz not null,
  lease_token text,
  leased_at timestamptz,
  lease_expires_at timestamptz,
  published_at timestamptz,
  dead_lettered_at timestamptz,
  dead_letter_reason text,
  attempt_count integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  foreign key (event_id, invitation_id)
    references neargather.invitation_states (event_id, invitation_id)
);

create table neargather.deletion_tombstones (
  tombstone_id text primary key,
  event_id text not null,
  invitation_id text,
  subject_table text not null,
  subject_id text not null,
  request_id text,
  reason text not null,
  tombstoned_at timestamptz not null,
  primary_erasure_due_at timestamptz not null,
  processor_erasure_due_at timestamptz not null,
  backup_expiry_at timestamptz not null,
  replay_protection_key text not null unique,
  foreign key (event_id, invitation_id)
    references neargather.invitation_states (event_id, invitation_id)
);

create function neargather.reject_append_only_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'append-only relation % does not allow %', tg_table_name, tg_op;
end;
$$;

create trigger invitation_state_history_append_only
before update or delete on neargather.invitation_state_history
for each row execute function neargather.reject_append_only_mutation();

create trigger adult_actor_assurance_receipts_append_only
before update or delete on neargather.adult_actor_assurance_receipts
for each row execute function neargather.reject_append_only_mutation();

create trigger guardian_authority_records_append_only
before update or delete on neargather.guardian_authority_records
for each row execute function neargather.reject_append_only_mutation();

create trigger on_behalf_disclosure_receipts_append_only
before update or delete on neargather.on_behalf_disclosure_receipts
for each row execute function neargather.reject_append_only_mutation();

create trigger processing_notice_receipts_append_only
before update or delete on neargather.processing_notice_receipts
for each row execute function neargather.reject_append_only_mutation();

create trigger consent_grants_append_only
before update or delete on neargather.consent_grants
for each row execute function neargather.reject_append_only_mutation();

create trigger opt_out_events_append_only
before update or delete on neargather.opt_out_events
for each row execute function neargather.reject_append_only_mutation();

create trigger messaging_suppressions_append_only
before update or delete on neargather.messaging_suppressions
for each row execute function neargather.reject_append_only_mutation();

create trigger data_rights_requests_append_only
before update or delete on neargather.data_rights_requests
for each row execute function neargather.reject_append_only_mutation();

create trigger deletion_tombstones_append_only
before update or delete on neargather.deletion_tombstones
for each row execute function neargather.reject_append_only_mutation();

alter table neargather.invitation_states enable row level security;
alter table neargather.invitation_state_history enable row level security;
alter table neargather.adult_actor_assurance_receipts enable row level security;
alter table neargather.guardian_authority_records enable row level security;
alter table neargather.on_behalf_disclosure_receipts enable row level security;
alter table neargather.processing_notice_receipts enable row level security;
alter table neargather.consent_grants enable row level security;
alter table neargather.media_license_receipts enable row level security;
alter table neargather.opt_out_events enable row level security;
alter table neargather.messaging_suppressions enable row level security;
alter table neargather.data_rights_requests enable row level security;
alter table neargather.provider_inbound_messages enable row level security;
alter table neargather.transactional_outbox enable row level security;
alter table neargather.deletion_tombstones enable row level security;

create policy invitation_states_event_scope
  on neargather.invitation_states
  using (event_id = current_setting('neargather.event_id', true));

create policy invitation_state_history_event_scope
  on neargather.invitation_state_history
  using (event_id = current_setting('neargather.event_id', true));

create policy adult_actor_assurance_receipts_event_scope
  on neargather.adult_actor_assurance_receipts
  using (event_id = current_setting('neargather.event_id', true));

create policy guardian_authority_records_event_scope
  on neargather.guardian_authority_records
  using (event_id = current_setting('neargather.event_id', true));

create policy on_behalf_disclosure_receipts_event_scope
  on neargather.on_behalf_disclosure_receipts
  using (event_id = current_setting('neargather.event_id', true));

create policy processing_notice_receipts_event_scope
  on neargather.processing_notice_receipts
  using (event_id = current_setting('neargather.event_id', true));

create policy consent_grants_event_scope
  on neargather.consent_grants
  using (event_id = current_setting('neargather.event_id', true));

create policy media_license_receipts_event_scope
  on neargather.media_license_receipts
  using (event_id = current_setting('neargather.event_id', true));

create policy opt_out_events_event_scope
  on neargather.opt_out_events
  using (event_id = current_setting('neargather.event_id', true));

create policy messaging_suppressions_event_scope
  on neargather.messaging_suppressions
  using (event_id = current_setting('neargather.event_id', true));

create policy data_rights_requests_event_scope
  on neargather.data_rights_requests
  using (event_id = current_setting('neargather.event_id', true));

create policy provider_inbound_messages_event_scope
  on neargather.provider_inbound_messages
  using (event_id = current_setting('neargather.event_id', true));

create policy transactional_outbox_event_scope
  on neargather.transactional_outbox
  using (event_id = current_setting('neargather.event_id', true));

create policy deletion_tombstones_event_scope
  on neargather.deletion_tombstones
  using (event_id = current_setting('neargather.event_id', true));
`;

export interface SchemaEnumDefinition {
  name: string;
  values: readonly string[];
}

export interface SchemaColumnDefinition {
  name: string;
  type: string;
  nullable?: boolean;
}

export interface SchemaUniqueConstraintDefinition {
  columns: readonly string[];
}

export interface SchemaForeignKeyDefinition {
  columns: readonly string[];
  referencesColumns: readonly string[];
  referencesTable: string;
}

export interface SchemaCheckDefinition {
  expression: string;
  name: string;
}

export interface SchemaTableDefinition {
  appendOnly?: boolean;
  checks?: readonly SchemaCheckDefinition[];
  columns: readonly SchemaColumnDefinition[];
  foreignKeys?: readonly SchemaForeignKeyDefinition[];
  name: string;
  primaryKey: readonly string[];
  rlsEnabled: boolean;
  unique?: readonly SchemaUniqueConstraintDefinition[];
}

export interface PersistedInvitationStateRecord {
  birthdayFormat: BirthdayFormat | null;
  eventId: string;
  eventType: EventType;
  invitationId: string;
  organizerExemption: OrganizerExemption | null;
  qualifyingContributionId: string | null;
  recordedAt: string;
  rsvpGatePromptAcceptedAt: string | null;
  rsvpState: RSVPState;
  state: InvitationState;
  version: number;
}

export interface InvitationStateHistoryRecord {
  eventId: string;
  invitationId: string;
  recordedAt: string;
  rsvpState: RSVPState;
  semanticIdempotencyKey: string;
  snapshot: InvitationState;
  stateVersion: number;
}

export interface AdultActorAssuranceRecord extends AdultActorAssurance {}

export interface GuardianAuthorityPersistenceRecord
  extends GuardianAuthorityRecord {}

export interface OnBehalfDisclosurePersistenceRecord
  extends OnBehalfDisclosureReceipt {}

export interface ProcessingNoticePersistenceRecord
  extends ProcessingNoticeReceipt {}

export interface ConsentGrantPersistenceRecord extends ConsentGrant {}

export interface MediaLicensePersistenceRecord extends MediaLicenseReceipt {}

export interface MessagingSuppressionRecord extends MessagingSuppression {
  suppressionId: string;
}

export interface OptOutPersistenceRecord extends OptOutEvent {
  semanticIdempotencyKey: string;
}

export interface DataRightsRequestRecord extends DataRightsRequest {
  backupExpiryAt: string | null;
  primaryErasureDueAt: string | null;
  processorErasureDueAt: string | null;
  tombstonedAt: string | null;
}

export interface ProviderInboundMessageRecord {
  eventId: string;
  invitationId: string | null;
  processingStatus: "PROCESSED" | "RECEIVED" | "REJECTED";
  providerInboundMessageId: string;
  providerMessageId: string;
  providerName: string;
  rawReceipt: Readonly<Record<string, unknown>>;
  receivedAt: string;
  semanticIdempotencyKey: string;
}

export interface DeletionTombstoneRecord {
  backupExpiryAt: string;
  eventId: string;
  invitationId: string | null;
  primaryErasureDueAt: string;
  processorErasureDueAt: string;
  reason: string;
  replayProtectionKey: string;
  requestId: string | null;
  subjectId: string;
  subjectTable: string;
  tombstonedAt: string;
  tombstoneId: string;
}

export interface TransactionalOutboxMessage {
  availableAt: string;
  eventId: string;
  invitationId: string | null;
  outboxId: string;
  payload: Readonly<Record<string, unknown>>;
  semanticIdempotencyKey: string;
  topic: string;
}

export interface LeasedOutboxMessage extends TransactionalOutboxMessage {
  attemptCount: number;
  deadLetterReason: string | null;
  deadLetteredAt: string | null;
  lastError: string | null;
  leaseExpiresAt: string | null;
  leasedAt: string | null;
  leaseToken: string | null;
  publishedAt: string | null;
}

export interface PersistInvitationStateInput {
  assurances?: readonly AdultActorAssuranceRecord[];
  consentGrants?: readonly ConsentGrantPersistenceRecord[];
  current: PersistedInvitationStateRecord;
  dataRightsRequests?: readonly DataRightsRequestRecord[];
  guardianAuthorityRecords?: readonly GuardianAuthorityPersistenceRecord[];
  history: InvitationStateHistoryRecord;
  mediaLicenses?: readonly MediaLicensePersistenceRecord[];
  onBehalfDisclosures?: readonly OnBehalfDisclosurePersistenceRecord[];
  optOutEvents?: readonly OptOutPersistenceRecord[];
  outboxMessages?: readonly TransactionalOutboxMessage[];
  processingNotices?: readonly ProcessingNoticePersistenceRecord[];
  suppressions?: readonly MessagingSuppressionRecord[];
}

export interface OutboxLeaseRequest {
  leaseDurationSeconds: number;
  limit: number;
  now: string;
}

export interface InvitationStateRepository {
  findByEventAndInvitation(
    eventId: string,
    invitationId: string
  ): Promise<PersistedInvitationStateRecord | null>;
  persist(input: PersistInvitationStateInput): Promise<void>;
  recordProviderInboundMessage(input: ProviderInboundMessageRecord): Promise<void>;
  recordDeletionTombstone(input: DeletionTombstoneRecord): Promise<void>;
}

export interface TransactionalOutboxRepository {
  enqueue(messages: readonly TransactionalOutboxMessage[]): Promise<void>;
  leaseAvailable(input: OutboxLeaseRequest): Promise<readonly LeasedOutboxMessage[]>;
  markPublished(outboxId: string, publishedAt: string): Promise<void>;
  releaseLease(input: {
    availableAt: string;
    lastError?: string;
    leaseToken: string;
    outboxId: string;
  }): Promise<void>;
}

export const nearGatherSchema = {
  enums: {
    birthdayFormat: {
      name: "neargather.birthday_format",
      values: Object.values(BirthdayFormat)
    },
    eventType: {
      name: "neargather.event_type",
      values: Object.values(EventType)
    },
    rsvpState: {
      name: "neargather.rsvp_state",
      values: Object.values(RSVPState)
    }
  },
  migrations: [
    {
      id: INITIAL_MIGRATION_ID,
      sql: INITIAL_MIGRATION_SQL
    }
  ],
  schemaName: "neargather",
  tables: {
    deletionTombstones: {
      appendOnly: true,
      columns: [
        { name: "tombstone_id", type: "text" },
        { name: "event_id", type: "text" },
        { name: "invitation_id", nullable: true, type: "text" },
        { name: "subject_table", type: "text" },
        { name: "subject_id", type: "text" },
        { name: "replay_protection_key", type: "text" }
      ],
      name: "neargather.deletion_tombstones",
      primaryKey: ["tombstone_id"],
      rlsEnabled: true,
      unique: [{ columns: ["replay_protection_key"] }]
    },
    invitationStateHistory: {
      appendOnly: true,
      columns: [
        { name: "event_id", type: "text" },
        { name: "invitation_id", type: "text" },
        { name: "state_version", type: "integer" },
        { name: "semantic_idempotency_key", type: "text" },
        { name: "snapshot_json", type: "jsonb" }
      ],
      foreignKeys: [
        {
          columns: ["event_id", "invitation_id"],
          referencesColumns: ["event_id", "invitation_id"],
          referencesTable: "neargather.invitation_states"
        }
      ],
      name: "neargather.invitation_state_history",
      primaryKey: ["event_id", "invitation_id", "state_version"],
      rlsEnabled: true,
      unique: [{ columns: ["semantic_idempotency_key"] }]
    },
    invitationStates: {
      checks: [
        {
          expression:
            "(event_type = 'BIRTHDAY' and birthday_format is not null) or (event_type <> 'BIRTHDAY' and birthday_format is null)",
          name: "birthday_format_matches_event_type"
        },
        {
          expression:
            "rsvp_state not in ('ATTENDING_INCOMPLETE', 'ATTENDING_COMPLETE') or (qualifying_contribution_id is not null and rsvp_gate_prompt_accepted_at is not null)",
          name: "attending_requires_gate_and_contribution"
        },
        {
          expression:
            "rsvp_state not in ('EXEMPT_INCOMPLETE', 'EXEMPT_COMPLETE') or organizer_exemption_audit_id is not null",
          name: "exempt_requires_audited_exception"
        }
      ],
      columns: [
        { name: "event_id", type: "text" },
        { name: "invitation_id", type: "text" },
        { name: "event_type", type: "neargather.event_type" },
        { name: "birthday_format", nullable: true, type: "neargather.birthday_format" },
        { name: "version", type: "integer" },
        { name: "rsvp_state", type: "neargather.rsvp_state" },
        { name: "qualifying_contribution_id", nullable: true, type: "text" },
        { name: "organizer_exemption_audit_id", nullable: true, type: "text" },
        { name: "rsvp_gate_prompt_accepted_at", nullable: true, type: "timestamptz" },
        { name: "state_json", type: "jsonb" }
      ],
      foreignKeys: [
        {
          columns: ["event_id", "invitation_id", "qualifying_contribution_id"],
          referencesColumns: ["event_id", "invitation_id", "contribution_id"],
          referencesTable: "neargather.accepted_contributions"
        },
        {
          columns: ["event_id", "invitation_id", "organizer_exemption_audit_id"],
          referencesColumns: ["event_id", "invitation_id", "audit_id"],
          referencesTable: "neargather.organizer_exemption_audits"
        }
      ],
      name: "neargather.invitation_states",
      primaryKey: ["event_id", "invitation_id"],
      rlsEnabled: true
    },
    providerInboundMessages: {
      columns: [
        { name: "provider_inbound_message_id", type: "text" },
        { name: "provider_name", type: "text" },
        { name: "provider_message_id", type: "text" },
        { name: "semantic_idempotency_key", type: "text" },
        { name: "raw_receipt", type: "jsonb" }
      ],
      name: "neargather.provider_inbound_messages",
      primaryKey: ["provider_inbound_message_id"],
      rlsEnabled: true,
      unique: [
        { columns: ["provider_message_id"] },
        { columns: ["semantic_idempotency_key"] }
      ]
    },
    transactionalOutbox: {
      columns: [
        { name: "outbox_id", type: "text" },
        { name: "event_id", type: "text" },
        { name: "invitation_id", nullable: true, type: "text" },
        { name: "topic", type: "text" },
        { name: "payload", type: "jsonb" },
        { name: "semantic_idempotency_key", type: "text" },
        { name: "available_at", type: "timestamptz" },
        { name: "lease_token", nullable: true, type: "text" },
        { name: "leased_at", nullable: true, type: "timestamptz" },
        { name: "lease_expires_at", nullable: true, type: "timestamptz" },
        { name: "published_at", nullable: true, type: "timestamptz" },
        { name: "dead_lettered_at", nullable: true, type: "timestamptz" },
        { name: "dead_letter_reason", nullable: true, type: "text" }
      ],
      name: "neargather.transactional_outbox",
      primaryKey: ["outbox_id"],
      rlsEnabled: true,
      unique: [{ columns: ["semantic_idempotency_key"] }]
    }
  }
} as const satisfies {
  enums: Record<string, SchemaEnumDefinition>;
  migrations: readonly { id: string; sql: string }[];
  schemaName: string;
  tables: Record<string, SchemaTableDefinition>;
};
