project_name = "devlog"

instance_type = "t3.small"

github_owner      = "salehairum"
github_repository = "DevLog"
github_branch     = "main"

repository_names = [
  "devlog-backend",
  "devlog-frontend"
]

keep_last_images = 5

# Leave null if using SSM only
key_name = null

# Example:
# allowed_ssh_cidr = "203.0.113.42/32"
allowed_ssh_cidr = null

aws_region = "us-east-1"