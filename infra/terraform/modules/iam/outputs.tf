output "instance_profile_name" {
  description = "Instance Profile name."
  value = aws_iam_instance_profile.ec2.name
}

output "role_name" {
  description = "EC2 IAM Role."
  value = aws_iam_role.ec2.name
}

output "role_arn" {
  description = "EC2 IAM Role ARN."
  value = aws_iam_role.ec2.arn
}