output "backend_env_parameter_name" {
  description = "Parameter containing the backend environment."
  value       = aws_ssm_parameter.backend_env.name
}

output "frontend_env_parameter_name" {
  description = "Parameter containing the frontend environment."
  value       = aws_ssm_parameter.frontend_env.name
}

output "firebase_service_account_parameter_name" {
  description = "Parameter containing the Firebase service account JSON."
  value       = aws_ssm_parameter.firebase_service_account.name
}