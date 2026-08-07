output "ec2_public_ip" {
  value       = module.ec2.public_ip
  description = "Public IP of the EC2 instance."
}

output "ec2_public_dns" {
  value       = module.ec2.public_dns
  description = "Public DNS of the EC2 instance."
}

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

output "elastic_ip" {
  value = aws_eip.server.public_ip
}