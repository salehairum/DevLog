resource "aws_ssm_parameter" "backend_env" {
  name = "/${var.project_name}/production/backend/env"
  type = "SecureString"
  value = "PLACEHOLDER"

  lifecycle {
    ignore_changes = [value]
  }
}

resource "aws_ssm_parameter" "frontend_env" {
  name = "/${var.project_name}/production/frontend/env"
  type = "SecureString"
  value = "PLACEHOLDER"

  lifecycle {
    ignore_changes = [value]
  }
}

resource "aws_ssm_parameter" "firebase_service_account" {
  name = "/${var.project_name}/production/backend/firebase-service-account"
  type = "SecureString"
  value = "PLACEHOLDER"

  lifecycle {
    ignore_changes = [value]
  }
}