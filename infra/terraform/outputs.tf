output "ecr_repository_urls" {
  value       = module.ecr.repository_urls
  description = "URLs of all ECR repositories."
}

output "github_actions_role_arn" {
  value       = module.github_oidc.role_arn
  description = "IAM Role assumed by GitHub Actions."
}

output "ec2_role_arn" {
  value       = module.iam.role_arn
  description = "IAM Role attached to EC2."
}

output "ec2_instance_id" {
  description = "ID of the DevLog EC2 instance"
  value       = module.ec2.instance_id
}

# output "elastic_ip" {
#   value = aws_eip.server.public_ip
# }