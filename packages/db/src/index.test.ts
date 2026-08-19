import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { BirthdayFormat, EventType, RSVPState } from "@neargather/contracts";
import { describe, expect, it } from "vitest";

import * as db from "./index";

const srcDir = dirname(fileURLToPath(import.meta.url));
const migrationPath = resolve(srcDir, "migrations/0001_initial.sql");

describe("@neargather/db", () => {
  it("exports schema metadata rooted in the canonical contracts", () => {
    const exported = db as Record<string, unknown>;

    expect(exported).toHaveProperty("nearGatherSchema");

    const schema = exported.nearGatherSchema as {
      enums: {
        birthdayFormat: { values: readonly string[] };
        eventType: { values: readonly string[] };
        rsvpState: { values: readonly string[] };
      };
      tables: {
        events: { primaryKey: readonly string[] };
        honorees: { primaryKey: readonly string[] };
        contributions: { primaryKey: readonly string[] };
        mediaAssets: { primaryKey: readonly string[] };
        invitationStates: { primaryKey: readonly string[] };
        transactionalOutbox: { unique: readonly { columns: readonly string[] }[] };
      };
    };

    expect(schema.enums.eventType.values).toEqual(Object.values(EventType));
    expect(schema.enums.birthdayFormat.values).toEqual(
      Object.values(BirthdayFormat)
    );
    expect(schema.enums.rsvpState.values).toEqual(Object.values(RSVPState));
    expect(schema.tables.events.primaryKey).toEqual(["event_id"]);
    expect(schema.tables.honorees.primaryKey).toEqual(["event_id", "honoree_id"]);
    expect(schema.tables.contributions.primaryKey).toEqual([
      "event_id",
      "invitation_id",
      "contribution_id"
    ]);
    expect(schema.tables.mediaAssets.primaryKey).toEqual([
      "event_id",
      "invitation_id",
      "asset_id"
    ]);
    expect(schema.tables.invitationStates.primaryKey).toEqual([
      "event_id",
      "invitation_id"
    ]);
    expect(schema.tables.transactionalOutbox.unique).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          columns: ["semantic_idempotency_key"]
        })
      ])
    );
  });

  it("ships the initial migration as both exported text and a SQL artifact", () => {
    const exported = db as Record<string, unknown>;

    expect(exported).toHaveProperty("INITIAL_MIGRATION_ID", "0001_initial");
    expect(exported).toHaveProperty("INITIAL_MIGRATION_SQL");
    expect(existsSync(migrationPath)).toBe(true);
    expect(readFileSync(migrationPath, "utf8")).toBe(exported.INITIAL_MIGRATION_SQL);
  });

  it("defines composite event foreign keys and RSVP guardrails in the SQL migration", () => {
    const exported = db as Record<string, unknown>;
    const migrationSql = String(exported.INITIAL_MIGRATION_SQL ?? "");

    expect(migrationSql).toMatch(
      /foreign key \(event_id, invitation_id, qualifying_contribution_id\)\s+references neargather\.accepted_contributions \(event_id, invitation_id, contribution_id\)/i
    );
    expect(migrationSql).toMatch(
      /foreign key \(event_id, invitation_id, organizer_exemption_audit_id\)\s+references neargather\.organizer_exemption_audits \(event_id, invitation_id, audit_id\)/i
    );
    expect(migrationSql).toMatch(/create table neargather\.honorees/i);
    expect(migrationSql).toMatch(/create table neargather\.contributions/i);
    expect(migrationSql).toMatch(/create table neargather\.media_assets/i);
    expect(migrationSql).toMatch(
      /check\s*\(\s*rsvp_state not in \('ATTENDING_INCOMPLETE', 'ATTENDING_COMPLETE'\)\s+or\s+\(\s*qualifying_contribution_id is not null\s+and\s+rsvp_gate_prompt_accepted_at is not null\s*\)\s*\)/i
    );
    expect(migrationSql).toMatch(
      /check\s*\(\s*rsvp_state not in \('EXEMPT_INCOMPLETE', 'EXEMPT_COMPLETE'\)\s+or\s+organizer_exemption_audit_id is not null\s*\)/i
    );
  });

  it("enables RLS, append-only protections, outbox leasing, provider idempotency, and deletion tombstones", () => {
    const exported = db as Record<string, unknown>;
    const migrationSql = String(exported.INITIAL_MIGRATION_SQL ?? "");

    expect(migrationSql).toMatch(
      /alter table neargather\.invitation_states enable row level security/i
    );
    expect(migrationSql).toMatch(
      /create trigger invitation_state_history_append_only\s+before update or delete on neargather\.invitation_state_history/i
    );
    expect(migrationSql).toMatch(
      /create table neargather\.transactional_outbox[\s\S]*lease_token text[\s\S]*lease_expires_at timestamptz[\s\S]*published_at timestamptz[\s\S]*dead_lettered_at timestamptz[\s\S]*dead_letter_reason text/i
    );
    expect(migrationSql).toMatch(/semantic_idempotency_key text not null unique/i);
    expect(migrationSql).toMatch(
      /create table neargather\.provider_inbound_messages[\s\S]*provider_message_id text not null unique/i
    );
    expect(migrationSql).toMatch(/create table neargather\.deletion_tombstones/i);
  });

  it("models terminal outbox failure separately from successful publication in schema metadata", () => {
    const exported = db as Record<string, unknown>;
    const schema = exported.nearGatherSchema as {
      tables: {
        transactionalOutbox: {
          columns: readonly { name: string; nullable?: boolean; type: string }[];
        };
      };
    };

    expect(schema.tables.transactionalOutbox.columns).toEqual(
      expect.arrayContaining([
        { name: "published_at", nullable: true, type: "timestamptz" },
        { name: "dead_lettered_at", nullable: true, type: "timestamptz" },
        { name: "dead_letter_reason", nullable: true, type: "text" }
      ])
    );
  });
});
