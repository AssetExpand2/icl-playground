// ICL Example: Access Control
// Complexity: Advanced
// Demonstrates: Role-based access control (RBAC), permission grants/revocations,
//   session management, and comprehensive audit logging.
// Key concepts: Multiple roles, conditional logic, audit trails, security invariants

Contract {
  Identity {
    stable_id: "ic-access-ctrl-001",
    version: 1,
    created_timestamp: 2026-05-20T08:00:00Z,
    owner: "security-admin",
    semantic_hash: "b7c8d9e0f1a2"
  }

  PurposeStatement {
    narrative: "Manages role-based access control for a multi-tenant platform. Handles permission assignment, session creation, and access auditing with separation of duties enforcement.",
    intent_source: "security-architecture-team",
    confidence_level: 0.98
  }

  DataSemantics {
    state: {
      user_id: String,
      role: String = "viewer",
      permissions: Array,
      session_active: Boolean = false,
      session_expiry: ISO8601,
      failed_attempts: Integer = 0,
      locked: Boolean = false,
      last_access: ISO8601,
      audit_trail: Array
    },
    invariants: [
      "failed_attempts >= 0",
      "failed_attempts <= 5 or locked == true",
      "session_active implies session_expiry is in the future",
      "role is one of: viewer, editor, admin, super_admin",
      "locked == true implies session_active == false"
    ]
  }

  BehavioralSemantics {
    operations: [
      {
        name: "create_session",
        precondition: "locked == false and session_active == false",
        parameters: {
          user_id: String,
          credentials: String,
          ip_address: String
        },
        postcondition: "session_active == true and session_expiry is set and failed_attempts == 0",
        side_effects: ["log_session_start", "set_session_cookie"],
        idempotence: "not_idempotent"
      },
      {
        name: "grant_permission",
        precondition: "session_active == true and role == admin or role == super_admin",
        parameters: {
          target_user: String,
          permission: String,
          granted_by: String
        },
        postcondition: "target_user permissions updated and audit_trail appended",
        side_effects: ["log_permission_change", "notify_target_user"],
        idempotence: "idempotent"
      },
      {
        name: "revoke_permission",
        precondition: "session_active == true and role == admin or role == super_admin",
        parameters: {
          target_user: String,
          permission: String,
          reason: String
        },
        postcondition: "permission removed from target_user and audit_trail appended",
        side_effects: ["log_permission_revocation", "invalidate_cached_permissions"],
        idempotence: "idempotent"
      },
      {
        name: "record_failed_login",
        precondition: "true",
        parameters: {
          user_id: String,
          ip_address: String
        },
        postcondition: "failed_attempts incremented; if failed_attempts > 5 then locked == true",
        side_effects: ["log_failed_attempt", "check_lockout_threshold"],
        idempotence: "not_idempotent"
      },
      {
        name: "unlock_account",
        precondition: "locked == true and caller role == super_admin",
        parameters: {
          user_id: String,
          unlocked_by: String,
          reason: String
        },
        postcondition: "locked == false and failed_attempts == 0 and audit_trail appended",
        side_effects: ["log_unlock", "notify_user"],
        idempotence: "idempotent"
      }
    ]
  }

  ExecutionConstraints {
    trigger_types: ["event_driven", "manual"],
    resource_limits: {
      max_memory_bytes: 4194304,
      computation_timeout_ms: 2000,
      max_state_size_bytes: 4194304
    },
    external_permissions: ["auth_service", "notification_service", "audit_system", "session_store"],
    sandbox_mode: "controlled_access"
  }

  HumanMachineContract {
    system_commitments: [
      "Sessions expire automatically after the configured timeout",
      "Accounts are locked after 5 consecutive failed login attempts",
      "All permission changes are logged with full audit trails",
      "Separation of duties: users cannot elevate their own permissions",
      "Locked accounts can only be unlocked by super_admin role"
    ],
    system_refusals: [
      "Will not create sessions for locked accounts",
      "Will not allow permission grants without admin role",
      "Will not delete audit trail entries",
      "Will not bypass lockout threshold"
    ],
    user_obligations: [
      "Must use strong credentials",
      "Must report unauthorized access immediately",
      "Must review audit logs weekly",
      "Must justify all permission changes with a reason"
    ]
  }
}
