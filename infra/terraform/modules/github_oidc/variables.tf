variable "github_owner" {
  description = "GitHub username or organization."
  type        = string
}

variable "github_repository" {
  description = "GitHub repository name."
  type        = string
}

variable "github_branch" {
  description = "GitHub branch allowed to assume the role."
  type        = string
  default     = "main"
}

variable "role_name" {
  description = "IAM Role name."
  type        = string
  default     = "GitHubActions-ECR-Push"
}

variable "ecr_repository_arns" {
  description = "ARNs of ECR repositories GitHub may push to."
  type        = list(string)
}

variable "oidc_provider_arn" {
  description = "ARN of the GitHub OIDC Provider."
  type        = string
}

variable "ansible_ssm_bucket_arn" {
  description = "ARN of the S3 bucket used by Ansible's SSM connection plugin."
  type        = string
}