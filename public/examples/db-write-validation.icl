// ICL Example: Database Write Validation
// Tests: Complete contract with all required sections, event-based trigger, restricted sandbox
// Source: ICL-Spec reference examples

Contract {
  Identity {
    stable_id: "ic-db-write-001",
    version: 1,
    created_timestamp: 2026-01-31T10:00:00Z,
    owner: "developer-team",
    semantic_hash: "a1b2c3d4e5f6"
  }

  PurposeStatement {
    narrative: "Validate database writes before execution",
    intent_source: "developer_specification",
    confidence_level: 1.0
  }

  DataSemantics {
    state: {
      table_name: String,
      column_name: String,
      write_type: Enum["insert", "update"],
      value_constraint: Object {
        type: String,
        min_length: Integer,
        max_length: Integer,
        pattern: String
      },
      permission_required: Boolean
    },
    invariants: [
      "table_name is not empty",
      "column_type is valid SQL type",
      "min_length <= max_length",
      "permission_required is boolean"
    ]
  }

  BehavioralSemantics {
    operations: [
      {
        name: "validate_write",
        precondition: "write_request_received",
        parameters: {
          table: String,
          column: String,
          value: String,
          user_id: UUID
        },
        postcondition: "validation_result_returned AND decision_logged",
        side_effects: ["log_validation_attempt"],
        idempotence: "idempotent"
      }
    ]
  }

  ExecutionConstraints {
    trigger_types: ["event_based"],
    resource_limits: {
      max_memory_bytes: 10485760,
      computation_timeout_ms: 50,
      max_state_size_bytes: 1048576
    },
    external_permissions: ["database_query"],
    sandbox_mode: "restricted"
  }

  HumanMachineContract {
    system_commitments: [
      "Every write is validated before execution",
      "Validation result is deterministic",
      "Failed validations prevent writes",
      "All decisions are logged immutably"
    ],
    system_refusals: [
      "Will not allow invalid writes",
      "Will not silently drop writes",
      "Will not modify validation rules without explicit update"
    ],
    user_obligations: [
      "May update validation constraints",
      "May review validation logs",
      "Must provide user_id for audit trail"
    ]
  }
}
