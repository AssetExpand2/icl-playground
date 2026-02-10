// ICL Example: API Rate Limiting
// Tests: Multiple operations, time-based triggers, full isolation sandbox
// Source: ICL-Spec reference examples

Contract {
  Identity {
    stable_id: "ic-ratelimit-001",
    version: 1,
    created_timestamp: 2026-01-31T10:15:00Z,
    owner: "platform-team",
    semantic_hash: "b2c3d4e5f6a7"
  }

  PurposeStatement {
    narrative: "Enforce rate limits on API endpoints",
    intent_source: "platform_specification",
    confidence_level: 1.0
  }

  DataSemantics {
    state: {
      endpoint: String,
      requests_per_minute: Integer = 60,
      requests_per_hour: Integer = 1000,
      burst_limit: Integer = 10,
      current_window: Object {
        minute_count: Integer,
        hour_count: Integer,
        last_reset: ISO8601
      }
    },
    invariants: [
      "requests_per_minute > 0",
      "requests_per_hour > requests_per_minute",
      "burst_limit <= requests_per_minute",
      "minute_count <= requests_per_minute",
      "hour_count <= requests_per_hour"
    ]
  }

  BehavioralSemantics {
    operations: [
      {
        name: "check_rate_limit",
        precondition: "api_request_received",
        parameters: {
          endpoint: String,
          user_id: UUID,
          timestamp: ISO8601
        },
        postcondition: "limit_decision_returned AND state_updated",
        side_effects: ["increment_counters", "reset_if_window_expired"],
        idempotence: "idempotent"
      },
      {
        name: "reset_window",
        precondition: "minute_window_expired",
        parameters: {
          timestamp: ISO8601
        },
        postcondition: "minute_counter_reset_or_preserved",
        side_effects: ["reset_minute_counter"],
        idempotence: "idempotent"
      }
    ]
  }

  ExecutionConstraints {
    trigger_types: ["event_based", "time_based"],
    resource_limits: {
      max_memory_bytes: 5242880,
      computation_timeout_ms: 10,
      max_state_size_bytes: 524288
    },
    external_permissions: [],
    sandbox_mode: "full_isolation"
  }

  HumanMachineContract {
    system_commitments: [
      "Rate limits enforced deterministically",
      "Windows reset at precise boundaries",
      "Burst limits prevent spike attacks",
      "All decisions are logged"
    ],
    system_refusals: [
      "Will not allow above-limit requests",
      "Will not drift window boundaries",
      "Will not lose count state"
    ],
    user_obligations: [
      "May configure rate limits",
      "May whitelist trusted endpoints",
      "Must respect 429 responses"
    ]
  }
}
