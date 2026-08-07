terraform {
  backend "s3" {
    bucket         = "devlog-terraform-state"
    key            = "devlog/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "devlog-terraform-lock"
    encrypt        = true
  }
}