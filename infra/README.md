# Terraform Bootstrap

The Terraform infrastructure uses a small **bootstrap configuration** to create the S3 bucket required for Terraform's remote state.

The bootstrap creates:

* **Amazon S3** — stores Terraform state and provides state locking.
* **S3 Versioning** — keeps previous versions of the state.
* **S3 Server-Side Encryption** — encrypts the state at rest.

Modern versions of Terraform can use S3 itself for state locking, so this project does not use DynamoDB for Terraform state locking.

---

## Why do we need a bootstrap?

Terraform needs somewhere to store its state.

Instead of keeping the state file locally, this project stores it remotely in an S3 bucket:

```text
S3
└── devlog-terraform-state
    └── devlog/
        └── terraform.tfstate
```

The S3 bucket must exist **before** the main Terraform configuration can use it as a backend.

Therefore, the S3 bucket is created using a separate bootstrap configuration.

```text
Bootstrap Terraform
        │
        └── S3 bucket
              │
              ├── Terraform state
              ├── State locking
              ├── Versioning
              └── Encryption
                    │
                    ▼
              Main Terraform
              ├── ECR
              ├── IAM
              ├── GitHub OIDC
              ├── EC2
              └── Security Groups
```

---

## S3 — Terraform State Storage

The S3 bucket stores the Terraform state file for the main infrastructure.

The state contains Terraform's record of the infrastructure it manages.

The state is stored under:

```text
devlog-terraform-state
└── devlog/
    └── terraform.tfstate
```

The bucket has **versioning enabled**, which means previous versions of the state can be retained.

This provides protection against accidentally overwriting or corrupting the current state.

The bucket also uses **AES256 server-side encryption**.

---

## S3 — Terraform State Locking

Modern Terraform versions support native locking through the S3 backend.

The backend is configured with:

```hcl
terraform {
  backend "s3" {
    bucket       = "devlog-terraform-state"
    key          = "devlog/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }
}
```

When Terraform starts an operation that modifies the state, it creates a lock file alongside the state:

```text
devlog/
├── terraform.tfstate
└── terraform.tfstate.tflock
```

Conceptually:

```text
Terraform A
    │
    ├── Acquire lock
    │
    ├── Modify infrastructure
    │
    ├── Update state
    │
    └── Release lock
```

If another Terraform process attempts to modify the same state while the lock is held, Terraform will not proceed simultaneously.

This prevents concurrent operations from interfering with each other.

---

## Bootstrap Workflow

The bootstrap configuration must be run **before** the main Terraform configuration.

### 1. Initialize Bootstrap

From the bootstrap directory:

```bash
terraform init
```

### 2. Review the Plan

```bash
terraform plan
```

The plan should create:

* S3 state bucket
* S3 versioning
* S3 server-side encryption

### 3. Apply Bootstrap

```bash
terraform apply
```

Confirm the operation by entering:

```text
yes
```

After this completes, the S3 bucket exists and is ready to be used as the main Terraform backend.

---

## Main Terraform Backend

The main Terraform configuration uses the S3 bucket created by the bootstrap.

```hcl
terraform {
  backend "s3" {
    bucket       = "devlog-terraform-state"
    key          = "devlog/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }
}
```

The main Terraform configuration can then be initialized:

```bash
terraform init
```

Terraform will use:

* **S3** → remote state storage
* **S3 lockfile** → state locking

---

## Bootstrap vs Main Infrastructure

The bootstrap resources are intentionally kept separate from the main Terraform state.

### Bootstrap manages

```text
S3 state bucket
├── Versioning
└── Encryption
```

### Main Terraform manages

```text
ECR repositories
IAM roles
GitHub OIDC
EC2 instance
Security groups
Networking resources
```

This separation is necessary because Terraform needs the S3 backend to exist before the main Terraform configuration can use it.

---

## Destroying Infrastructure

Running:

```bash
terraform destroy
```

from the **main Terraform directory** destroys the resources managed by the main Terraform state.

It does not destroy the bootstrap S3 bucket because the bucket belongs to the separate bootstrap Terraform configuration.

This allows the main infrastructure to be repeatedly created and destroyed:

```text
terraform apply
       ↓
Create infrastructure
       ↓
Test / verify
       ↓
terraform destroy
       ↓
Main infrastructure removed
       ↓
S3 backend remains
       ↓
terraform apply
       ↓
Infrastructure can be recreated
```

The bootstrap S3 bucket should only be destroyed when you intentionally want to remove the Terraform backend itself.

> **Important:** Do not delete the S3 state bucket while the main Terraform state is still needed. The bucket contains the state Terraform uses to manage the infrastructure.
