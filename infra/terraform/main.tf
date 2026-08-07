module "oidc" {
  source = "./modules/oidc"
}

module "ecr" {
  source = "./modules/ecr"

  repository_names = var.repository_names
  keep_last_images = var.keep_last_images
}

module "github_oidc" {
  source = "./modules/github_oidc"

  oidc_provider_arn = module.oidc.provider_arn

  role_name = "${var.project_name}-GitHubActions"

  github_owner      = var.github_owner
  github_repository = var.github_repository
  github_branch     = var.github_branch

  ecr_repository_arns = values(module.ecr.repository_arns)
}

module "iam" {
  source = "./modules/iam"

  role_name = "${var.project_name}-EC2-Role"
}

module "ec2" {
  source = "./modules/ec2"

  project_name = var.project_name

  instance_type = var.instance_type

  iam_instance_profile = module.iam.instance_profile_name

  key_name         = var.key_name
  allowed_ssh_cidr = var.allowed_ssh_cidr
}