variable "project_name" {
  description = "Project name."
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type."
  type        = string
  default     = "t3.small"
}

variable "key_name" {
  description = "SSH Key Pair name (optional)."
  type        = string
  default     = null
}

variable "iam_instance_profile" {
  description = "IAM Instance Profile."
  type        = string
}

variable "allowed_ssh_cidr" {
  description = "CIDR allowed to SSH."
  type        = string
  default     = null
}