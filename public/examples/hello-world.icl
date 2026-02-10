// ICL Example: Hello World
// Tests: Minimal complete contract with all required sections
// Purpose: Simplest valid ICL contract for learning

Contract {
  Identity {
    stable_id: "ic-hello-001",
    version: 1,
    created_timestamp: 2026-02-01T10:00:00Z,
    owner: "developer",
    semantic_hash: "e5f6a7b8c9d0"
  }

  PurposeStatement {
    narrative: "Simple contract that echoes input messages",
    intent_source: "tutorial",
    confidence_level: 1.0
  }

  DataSemantics {
    state: {
      message: String,
      count: Integer = 0
    },
    invariants: [
      "message is not empty",
      "count >= 0"
    ]
  }

  BehavioralSemantics {
    operations: [
      {
        name: "echo",
        precondition: "input_provided",
        parameters: {
          message: String
        },
        postcondition: "state_updated_with_message",
        side_effects: ["log_operation"],
        idempotence: "idempotent"
      }
    ]
  }

  ExecutionConstraints {
    trigger_types: ["manual"],
    resource_limits: {
      max_memory_bytes: 1048576,
      computation_timeout_ms: 100,
      max_state_size_bytes: 1048576
    },
    external_permissions: [],
    sandbox_mode: "full_isolation"
  }

  HumanMachineContract {
    system_commitments: [
      "All messages are echoed",
      "Count increments correctly",
      "No messages lost"
    ],
    system_refusals: [
      "Will not modify past messages",
      "Will not lose data"
    ],
    user_obligations: [
      "May provide new messages",
      "May reset count"
    ]
  }
}
