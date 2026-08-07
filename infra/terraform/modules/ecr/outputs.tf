output "repository_urls" {
  description = "URLs of the created ECR repositories."

  value = {
    for name, repo in aws_ecr_repository.repositories :
    name => repo.repository_url
  }
}

output "repository_names" {
  description = "Names of the repositories."

  value = [
    for repo in aws_ecr_repository.repositories :
    repo.name
  ]
}

output "repository_arns" {
  description = "ARNs of the created repositories."

  value = {
    for name, repo in aws_ecr_repository.repositories :
    name => repo.arn
  }
}