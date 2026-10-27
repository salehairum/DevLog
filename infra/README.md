# DevLog Infrastructure

This directory contains the infrastructure and deployment configuration for DevLog.

For a component-by-component explanation of the architecture, IAM/OIDC trust,
Terraform resources, and Ansible responsibilities, see
[ARCHITECTURE.md](./ARCHITECTURE.md). This README remains the operational guide
for commands and setup.

The infrastructure is split into four stages:

```text
terraform-bootstrap
        │
        ▼
Terraform infrastructure
        │
        ├── EC2
        ├── ECR
        ├── IAM
        ├── GitHub Actions OIDC
        ├── SSM
        └── Parameter Store
                │
                ▼
        Ansible bootstrap
                │
                ▼
        Ansible deploy
                │
                ▼
        Running DevLog application
```

---

# Directory Structure

```text
infra/
├── README.md
│
├── terraform-bootstrap/
│   └── Terraform configuration for the remote state bucket
│
├── terraform/
│   ├── main.tf
│   ├── backend.tf
│   ├── providers.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── terraform.tfvars
│   ├── populate-parameters.sh
│   │
│   └── modules/
│       ├── ansible_ssm_bucket/
│       ├── ec2/
│       ├── ecr/
│       ├── github_oidc/
│       ├── iam/
│       ├── oidc/
│       └── parameter_store/
│
└── ansible/
    ├── ansible.cfg
    ├── requirements.yml
    ├── requirements.txt
    ├── bootstrap.yml
    ├── deploy.yml
    ├── checks.md
    ├── inventory/
    │   └── hosts.ini
    └── templates/
        └── compose.yml.j2
```

---

# 1. Terraform Bootstrap

The `terraform-bootstrap/` configuration creates the S3 bucket used for the main Terraform state.

The bucket provides:

* Remote Terraform state
* State locking through the S3 lockfile
* State versioning
* Server-side encryption

The bootstrap has its own local Terraform state because the main Terraform configuration cannot use an S3 backend until the bucket exists.

## Run it

```bash
cd infra/terraform-bootstrap

terraform init
terraform plan
terraform apply
```

After the bucket has been created, the main Terraform configuration can use it as its backend.

Do not destroy this bucket during normal infrastructure testing.

---

# 2. Main Terraform Infrastructure

The main Terraform configuration is in:

```text
infra/terraform/
```

It uses the S3 bucket created by the bootstrap as its backend.

Initialize it with:

```bash
cd infra/terraform

terraform init
```

Review the infrastructure:

```bash
terraform plan
```

Apply it:

```bash
terraform apply
```

The main Terraform configuration provisions the AWS infrastructure required by DevLog.

## Main modules

### `ecr`

Creates the ECR repositories used for the backend and frontend Docker images.

### `iam`

Creates the EC2 IAM role and instance profile.

The EC2 role currently allows:

* SSM management
* Pulling images from ECR
* Reading DevLog parameters from AWS Parameter Store

The EC2 trust policy allows the EC2 service to assume the role.

### `ec2`

Creates the DevLog EC2 instance and attaches the IAM instance profile.

### `oidc` / `github_oidc`

Configures GitHub Actions authentication with AWS using OIDC.

This allows GitHub Actions to access AWS without storing long-lived AWS credentials.

### `ansible_ssm_bucket`

Creates the S3 bucket used by Ansible's AWS SSM connection.

### `parameter_store`

Creates the Parameter Store entries used for DevLog runtime configuration.

---

# 3. Parameter Store

DevLog stores runtime configuration in AWS Systems Manager Parameter Store.

The current parameters are:

```text
/devlog/production/backend/env
/devlog/production/frontend/env
/devlog/production/backend/firebase-service-account
```

All three are stored as `SecureString` parameters.

They contain:

```text
backend/env
    → complete backend .env

frontend/env
    → complete frontend .env

firebase-service-account
    → complete Firebase service-account JSON
```

Terraform creates the parameter resources, but the actual values are populated separately.

This prevents the application secrets from being placed directly into the Terraform configuration.

---

# 4. Populate Parameter Store

The file:

```text
terraform/populate-parameters.sh
```

populates the Parameter Store values from the local DevLog configuration files.

The script is intentionally gitignored because it operates on local configuration and secrets.

Make it executable if necessary:

```bash
chmod +x populate-parameters.sh
```

Run it from:

```text
infra/terraform/
```

with the project name:

```bash
./populate-parameters.sh devlog
```

The script reads:

```text
../../backend/.env
../../frontend/.env
../../backend/firebase-service-account.json
```

and uploads them to Parameter Store.

Use the script again whenever these local configuration values need to be updated.

---

# 5. Ansible Setup

Ansible is used for configuring and deploying the EC2 instance.

Ansible connects to the EC2 through AWS Systems Manager rather than SSH.

The Ansible environment uses a Python virtual environment.

From:

```bash
cd infra/ansible
```

activate the environment:

```bash
source .venv/bin/activate
```

Verify connectivity:

```bash
ansible devlog -m ansible.builtin.ping
```

A successful result should contain:

```text
"ping": "pong"
```

The required Ansible collections are defined in:

```text
requirements.yml
```

---

# 6. Ansible Bootstrap

The file:

```text
ansible/bootstrap.yml
```

is responsible for preparing a new EC2 instance.

It installs and configures:

* Docker Engine
* Docker Compose
* Docker Buildx
* ECR credential helper
* Required system packages

It also:

* Enables Docker
* Creates `/opt/devlog`
* Configures Docker to use the ECR credential helper
* Verifies the installed tools

Run it with:

```bash
cd infra/ansible

ansible-playbook bootstrap.yml
```

This is machine setup rather than application deployment.

The EC2 IAM role provides the AWS credentials used by the ECR credential helper.

No static ECR username/password is stored on the EC2.

---

# 7. Ansible Deployment

The file:

```text
ansible/deploy.yml
```

is responsible for deploying the DevLog application.

It is separate from `bootstrap.yml`.

The intended flow is:

```text
GitHub Actions
      │
      ├── build backend image
      ├── build frontend image
      ├── push images to ECR
      │
      └── provide commit SHA tags
              │
              ▼
         deploy.yml
              │
              ├── retrieve runtime configuration
              ├── render compose.yaml
              ├── pull images
              └── start/update containers
```

The Docker image tags are based on the Git commit SHA.

For example:

```text
backend:088e50
frontend:088e50
```

The Compose template is:

```text
ansible/templates/compose.yml.j2
```

Ansible renders it into:

```text
/opt/devlog/compose.yaml
```

The generated Compose file runs:

```text
backend
frontend
mongo
```

with persistent Docker/host storage where required.

---

# 8. EC2 Deployment Layout

After deployment, the EC2 should contain approximately:

```text
/opt/devlog/
├── compose.yaml
│
├── backend/
│   ├── .env
│   ├── firebase-service-account.json
│   └── chroma_persist/
│
└── frontend/
    └── .env
```

The application source code itself is **not copied to EC2**.

It is already contained in the Docker images stored in ECR.

MongoDB data is stored in the Docker volume:

```text
mongo_data
```

---

# 9. Deployment Lifecycle

For a new EC2 instance:

```text
1. terraform-bootstrap
        ↓
2. terraform apply
        ↓
3. EC2 created
        ↓
4. ansible/bootstrap.yml
        ↓
5. Docker + Compose + ECR authentication configured
        ↓
6. populate Parameter Store
        ↓
7. GitHub Actions builds/pushes images
        ↓
8. ansible/deploy.yml
        ↓
9. Application running
```

For a normal application update:

```text
Code change
    ↓
GitHub Actions
    ↓
Build Docker images
    ↓
Push images to ECR
    ↓
Run deploy.yml with new commit SHA
    ↓
Pull new images
    ↓
Recreate changed containers
```

The EC2 does not need to be bootstrapped again for every application deployment.

---

# 10. EC2 Reboots

Docker is configured to start automatically through systemd.

The application containers use Docker Compose restart policies so they can restart after an EC2 reboot.

Therefore:

```text
EC2 reboot
    ↓
Docker starts
    ↓
DevLog containers restart
```

A normal EC2 stop/start does not remove the instance's IAM role or ECR permissions.

---

# 11. Destroying Infrastructure

To remove the main DevLog infrastructure:

```bash
cd infra/terraform

terraform destroy
```

This destroys resources managed by the main Terraform state.

The Terraform state bucket created by `terraform-bootstrap` remains.

The bootstrap should only be destroyed deliberately when the Terraform backend is no longer needed.

---

# Quick Reference

## Bootstrap Terraform

```bash
cd infra/terraform-bootstrap
terraform init
terraform plan
terraform apply
```

## Main Terraform

```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```

## Populate Parameters

```bash
cd infra/terraform
./populate-parameters.sh devlog
```

## Test Ansible

```bash
cd infra/ansible
source .venv/bin/activate
ansible devlog -m ansible.builtin.ping
```

## Bootstrap EC2

```bash
ansible-playbook bootstrap.yml
```

## Deploy Application

```bash
ansible-playbook deploy.yml
```

The deployment should eventually be triggered automatically by GitHub Actions after new Docker images are pushed to ECR.
