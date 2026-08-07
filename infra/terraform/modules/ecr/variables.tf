variable "repository_names" {
  description = "List of ECR repositories to create."
  type        = list(string)
}

variable "image_tag_mutability" {
  description = "Whether image tags can be overwritten."
  type        = string
  default     = "MUTABLE"
}

variable "scan_on_push" {
  description = "Enable image vulnerability scanning."
  type        = bool
  default     = true
}

variable "keep_last_images" {
  description = "Number of tagged images to keep."
  type        = number
  default     = 10
}