output "bucket_name" {
  description = "Name of the Ansible SSM S3 bucket"
  value       = aws_s3_bucket.ansible_ssm.bucket
}

output "bucket_arn" {
  description = "ARN of the Ansible SSM S3 bucket"
  value       = aws_s3_bucket.ansible_ssm.arn
}