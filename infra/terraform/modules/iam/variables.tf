variable "role_name" {
  description = "Name of the EC2 IAM role."
  type        = string
  default     = "DevLog-EC2-Role"
}

variable "account_id" {
  description = "AWS account ID."
  type        = string
}