variable "project_name" {
  type = string
}

variable "instance_type" {
  type = string
}

variable "key_name" {
  type    = string
  default = null
}

variable "allowed_ssh_cidr" {
  type    = string
  default = null
}

variable "github_owner" {
  type = string
}

variable "github_repository" {
  type = string
}

variable "github_branch" {
  type    = string
  default = "main"
}

variable "repository_names" {
  type = list(string)
}

variable "keep_last_images" {
  type = number
}

variable "aws_region" {
  type        = string
  description = "AWS region to deploy into."
}