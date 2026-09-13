variable "bucket_name" {
  description = "Name of the S3 bucket used by Ansible's SSM connection plugin"
  type        = string
}

variable "project_name" {
  description = "Project name used for tagging"
  type        = string
}