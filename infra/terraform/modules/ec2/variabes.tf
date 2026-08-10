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

variable "vpc_cidr" {
  description = "CIDR block for the DevLog VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for the public subnet."
  type        = string
  default     = "10.0.1.0/24"
}

variable "availability_zone" {
  description = "Availability zone for the public subnet."
  type        = string
  default     = "us-east-1a"
}