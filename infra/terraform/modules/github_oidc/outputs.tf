output "role_arn" {
  description = "IAM Role ARN for GitHub Actions."

  value = aws_iam_role.github_actions.arn
}

output "role_name" {
  description = "IAM Role name."

  value = aws_iam_role.github_actions.name
}