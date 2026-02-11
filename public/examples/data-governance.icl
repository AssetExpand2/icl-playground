// ICL Example: Data Governance
// Complexity: Advanced
// Demonstrates: GDPR-style data retention policies, consent management,
//   and automated data lifecycle operations with strict audit trails.
// Key concepts: Multiple operations, complex state schema, external permissions

Contract {
  Identity {
    stable_id: "ic-data-gov-001",
    version: 1,
    created_timestamp: 2026-03-15T09:00:00Z,
    owner: "data-protection-officer",
    semantic_hash: "a1b2c3d4e5f6"
  }

  PurposeStatement {
    narrative: "Manages personal data retention, consent tracking, and automated deletion policies in compliance with privacy regulations",
    intent_source: "compliance-department",
    confidence_level: 0.95
  }

  DataSemantics {
    state: {
      subject_id: String,
      consent_given: Boolean = false,
      consent_timestamp: ISO8601,
      retention_days: Integer = 365,
      data_categories: Array<String>,
      deletion_requested: Boolean = false,
      deletion_deadline: ISO8601,
      audit_log: Array<String>
    },
    invariants: [
      "retention_days > 0",
      "retention_days <= 3650",
      "consent_given implies consent_timestamp is set",
      "deletion_requested implies deletion_deadline is set"
    ]
  }

  BehavioralSemantics {
    operations: [
      {
        name: "grant_consent",
        precondition: "consent_given == false",
        parameters: {
          subject_id: String,
          categories: Array<String>
        },
        postcondition: "consent_given == true and consent_timestamp is set",
        side_effects: ["log_consent_event", "notify_controller"],
        idempotence: "idempotent"
      },
      {
        name: "revoke_consent",
        precondition: "consent_given == true",
        parameters: {
          subject_id: String,
          reason: String
        },
        postcondition: "consent_given == false and deletion_requested == true",
        side_effects: ["log_revocation", "schedule_deletion"],
        idempotence: "idempotent"
      },
      {
        name: "process_deletion",
        precondition: "deletion_requested == true",
        parameters: {
          subject_id: String
        },
        postcondition: "data_categories is empty and audit_log updated",
        side_effects: ["delete_personal_data", "log_deletion_complete", "notify_subject"],
        idempotence: "idempotent"
      }
    ]
  }

  ExecutionConstraints {
    trigger_types: ["scheduled", "manual", "event_driven"],
    resource_limits: {
      max_memory_bytes: 4194304,
      computation_timeout_ms: 5000,
      max_state_size_bytes: 2097152
    },
    external_permissions: ["database_write", "notification_service", "audit_system"],
    sandbox_mode: "controlled_access"
  }

  HumanMachineContract {
    system_commitments: [
      "Personal data is deleted within the specified retention period",
      "Consent changes are logged with timestamps",
      "Deletion requests are processed within 30 days",
      "All operations produce audit trail entries"
    ],
    system_refusals: [
      "Will not process data without valid consent",
      "Will not extend retention beyond legal maximum",
      "Will not skip audit logging for any operation"
    ],
    user_obligations: [
      "Must provide valid subject identifiers",
      "Must specify data categories for consent",
      "Must review audit logs periodically"
    ]
  }
}
