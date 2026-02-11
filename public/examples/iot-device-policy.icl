// ICL Example: IoT Device Policy
// Complexity: Intermediate
// Demonstrates: Sensor data thresholds, automated alerts, and device
//   state management for IoT environments.
// Key concepts: Numeric constraints, event-driven triggers, state invariants

Contract {
  Identity {
    stable_id: "ic-iot-sensor-001",
    version: 1,
    created_timestamp: 2026-04-10T14:30:00Z,
    owner: "iot-platform-admin",
    semantic_hash: "f0e1d2c3b4a5"
  }

  PurposeStatement {
    narrative: "Monitors temperature sensor readings and triggers alerts when thresholds are exceeded. Maintains device health status and reading history.",
    intent_source: "facilities-team",
    confidence_level: 0.9
  }

  DataSemantics {
    state: {
      device_id: String,
      current_temp: Float = 0.0,
      min_threshold: Float = -10.0,
      max_threshold: Float = 45.0,
      alert_active: Boolean = false,
      reading_count: Integer = 0,
      last_reading_time: ISO8601,
      status: String = "online"
    },
    invariants: [
      "min_threshold < max_threshold",
      "reading_count >= 0",
      "status is one of: online, offline, alert, maintenance"
    ]
  }

  BehavioralSemantics {
    operations: [
      {
        name: "record_reading",
        precondition: "status != offline",
        parameters: {
          device_id: String,
          temperature: Float,
          timestamp: ISO8601
        },
        postcondition: "current_temp updated and reading_count incremented",
        side_effects: ["store_reading", "check_thresholds"],
        idempotence: "not_idempotent"
      },
      {
        name: "trigger_alert",
        precondition: "current_temp > max_threshold or current_temp < min_threshold",
        parameters: {
          device_id: String,
          severity: String
        },
        postcondition: "alert_active == true and status == alert",
        side_effects: ["send_notification", "log_alert"],
        idempotence: "idempotent"
      },
      {
        name: "acknowledge_alert",
        precondition: "alert_active == true",
        parameters: {
          device_id: String,
          operator: String
        },
        postcondition: "alert_active == false and status == online",
        side_effects: ["log_acknowledgment"],
        idempotence: "idempotent"
      }
    ]
  }

  ExecutionConstraints {
    trigger_types: ["event_driven", "manual"],
    resource_limits: {
      max_memory_bytes: 2097152,
      computation_timeout_ms: 500,
      max_state_size_bytes: 1048576
    },
    external_permissions: ["sensor_read", "notification_service"],
    sandbox_mode: "controlled_access"
  }

  HumanMachineContract {
    system_commitments: [
      "Readings are processed within 500ms",
      "Alerts trigger immediately when thresholds are breached",
      "All readings are stored with timestamps",
      "Device status is always accurate"
    ],
    system_refusals: [
      "Will not accept readings from offline devices",
      "Will not suppress threshold alerts",
      "Will not modify historical readings"
    ],
    user_obligations: [
      "Must configure valid threshold ranges",
      "Must acknowledge alerts in a timely manner",
      "Must maintain device connectivity"
    ]
  }
}
