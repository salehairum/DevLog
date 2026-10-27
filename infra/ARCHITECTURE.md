# DevLog Infrastructure Architecture

This document explains how the current DevLog infrastructure fits together and
why its AWS resources and access policies exist. It describes the configuration
in this repository; it is not a claim that every step is automated or that this
single-host design provides production-grade high availability.

For setup and operational commands, see the [infrastructure README](./README.md).

## At a glance

```text
Developer pushes application changes to main
                 │
                 ▼
      GitHub Actions workflow
      ├── exchanges GitHub OIDC token for an AWS role
      ├── builds changed frontend/backend images
      ├── pushes images to Amazon ECR
      └── attempts to update image tags in the repository's compose.yml

      Ansible deployment is a separate operation
                 │
                 ▼
      AWS Systems Manager Session Manager
      ├── transports Ansible commands to EC2
      └── uses a dedicated, private S3 bucket for file transfer
                 │
                 ▼
        EC2 instance in a public subnet
        ├── Docker Compose: frontend, backend, MongoDB
        ├── retrieves runtime secrets from Parameter Store
        └── pulls frontend/backend images from ECR
```

Terraform provisions the AWS resources and permissions. Ansible configures the
host and deploys the application onto it. GitHub Actions builds and publishes
application images. These are separate responsibilities so that application
releases do not need to recreate the underlying AWS infrastructure.

## Runtime request and data flow

The application runs as three Docker Compose services on one EC2 instance:

1. **Frontend** serves the built React application through Nginx. The instance
   publishes container port 80 as host port 80.
2. **Backend** runs the Python application under Gunicorn on port 5000. Nginx
   proxies `/api/` requests to the backend using the Compose service name. The
   backend port is exposed to the Compose network, not published on the host.
3. **MongoDB** is available to the other Compose services on the internal
   Compose network. Its port is not published on the host.

The backend also has a host bind mount for Chroma's persisted files, and MongoDB
uses the named Docker volume `mongo_data`. Both are local to the EC2 host.
Neither is, by itself, a backup or protection against loss of that host.

The deployed Compose definition is rendered from
[`ansible/templates/compose.yml.j2`](./ansible/templates/compose.yml.j2) into
`/opt/devlog/compose.yaml`. The frontend and backend images are stored in
Amazon ECR; application source is shipped in those images rather than copied
onto the instance.

## Identity and access: why OIDC and policies exist

AWS IAM policies answer two separate questions:

- A **trust policy** says *who can assume a role*.
- A **permissions policy** says *what an assumed role can do*.

Keeping these separate makes the identity boundary and granted capabilities
visible and independently reviewable.

### GitHub Actions to AWS: OIDC role

The `oidc` module registers GitHub's Actions OIDC issuer as an AWS IAM
OpenID Connect provider. The `github_oidc` module creates a role trusted by
that provider. The role trust conditions require both:

- The token audience to be `sts.amazonaws.com`, the AWS STS audience.
- The token subject to identify the configured repository and branch.

The workflow requests `id-token: write` and uses that identity to assume the
role with `AssumeRoleWithWebIdentity`. AWS issues temporary credentials for
the job. This avoids saving a long-lived AWS access key in GitHub secrets,
where it would be harder to limit its lifetime and rotation risk.

The branch/repository conditions are a meaningful security boundary: only a
matching GitHub Actions identity should be able to assume this role. Changes to
the configured owner, repository, or branch must stay aligned with the trust
policy.

### GitHub Actions role permissions

The role has policies for the operations the workflow and Ansible connection
need:

- **ECR publishing:** authorization-token access is account-wide as required
  by ECR, while image upload and repository operations are scoped to the ECR
  repositories Terraform creates.
- **Systems Manager sessions:** permits starting, resuming, terminating, and
  discovering SSM sessions for host management. The current policy uses `*` for
  resources for these session actions, rather than restricting them to the
  single instance.
- **Ansible SSM file transfer:** permits listing/locating the dedicated S3
  bucket and reading, writing, and deleting objects within it. The bucket is
  scoped to this purpose; the policy does not grant general S3 access.

The GitHub role does not have broad administrator permissions. Its purpose is
deployment-related access: publishing application images and accessing the
SSM-based host-management path.

### EC2 role and instance profile

The EC2 IAM role trusts the EC2 service. Terraform places that role in an
instance profile and attaches the profile to the server. AWS then provides
temporary role credentials to software running on the instance, without
putting access keys on disk.

The role receives:

- `AmazonSSMManagedInstanceCore`, so the SSM agent can register the instance
  and support Session Manager.
- `AmazonEC2ContainerRegistryReadOnly`, so Docker and the ECR credential
  helper can authenticate and pull private images.
- A custom Parameter Store read policy for the DevLog production parameter
  path, so the host can retrieve runtime configuration.

These are distinct from the GitHub role: GitHub pushes images and initiates
management sessions; the EC2 role pulls images and reads application
configuration.

## Terraform resources and their purposes

The root configuration in `terraform/` composes small modules. The modules
make resource responsibilities easier to understand and keep role, network,
image registry, and configuration resources separate.

### Terraform state bootstrap

`terraform-bootstrap/` creates the S3 bucket used by the main Terraform
configuration. It enables bucket versioning and server-side encryption. The
main backend uses that bucket for remote state and enables S3's native
lockfile (`use_lockfile = true`) so concurrent Terraform operations do not
silently overwrite one another. The backend bucket name is fixed in
`terraform/backend.tf`; the bootstrap `project_name` must produce exactly that
name or initialization will not use the bucket bootstrap created.

Bootstrap is separate because the main backend cannot use a bucket before that
bucket exists. Its own Terraform state is local, so it needs separate care and
backup. The bootstrap bucket currently has `force_destroy = true`; destroying
the bootstrap stack can therefore remove the bucket and its contents. That
setting makes accidental teardown a potentially serious state-recovery risk.

Terraform state is operationally sensitive: it describes infrastructure and
may include provider-returned metadata. Protect access to the state bucket and
local bootstrap state accordingly.

### Network and EC2

The `ec2` module creates:

- A VPC with DNS support and hostnames.
- One public subnet in one configured availability zone.
- An internet gateway and a default route to it.
- A security group and an Ubuntu 24.04 EC2 instance with a public IP.

This is a deliberately direct, compact hosting topology: the server can reach
the internet to install packages, contact AWS services, and pull images without
a NAT gateway, and users can reach the frontend through the instance.

The security group allows inbound TCP 80 and 443 from anywhere. SSH is only
added when `allowed_ssh_cidr` is configured; its default is unset. Ansible is
configured to use SSM rather than SSH, so SSH is not required for the current
management path. The Nginx configuration in this repository listens on port
80; allowing port 443 at the security-group layer does not itself configure
TLS, a certificate, or an HTTPS listener.

There is no load balancer, private application subnet, multi-AZ fleet, or
elastic IP configured in the active Terraform resources. The commented-out
elastic IP resource is not deployed. A recreated instance may therefore have
a different public IP, and this design has a single-host availability and
capacity boundary.

### ECR image repositories

The `ecr` module creates a repository per configured application image name.
Image scanning is enabled on push. Tags are mutable in the current defaults,
which permits updating convenience tags such as `latest`. A lifecycle policy
retains a configured number of the newest tagged images to limit registry
storage growth.

The deployment uses commit-derived tags to identify releases; `latest` is
published as an additional convenience tag. Retention means older tagged
images may eventually expire, so ECR is not an indefinite archive of every
release.

### Parameter Store

The `parameter_store` module creates three `SecureString` parameters:

- `/devlog/production/backend/env`
- `/devlog/production/frontend/env`
- `/devlog/production/backend/firebase-service-account`

Terraform creates the parameter names, but uses placeholder values and
ignores later value changes. The actual runtime contents are populated
separately; the configuration files and service-account material should not be
committed to the repository. Since no customer-managed KMS key is configured,
SecureString uses Parameter Store's default AWS-managed encryption key.

During deployment, Ansible retrieves the parameter contents with decryption
enabled, writes them to the host with restrictive file permissions, and marks
the retrieval and file-writing tasks `no_log` to reduce secret exposure in
Ansible output. The files are then supplied to the containers as runtime
configuration. This keeps application secrets out of the image build and
source repository, but the plaintext files still exist on the EC2 filesystem
while the application is deployed.

### S3 bucket for Ansible transfers

The `ansible_ssm_bucket` module creates a separate S3 bucket used by the
Ansible AWS SSM connection plugin for file transfers. It blocks public access
and enables AES-256 server-side encryption. This is not the Terraform state
bucket and is not the application artifact store; ECR stores the images.

### Terraform module map

| Module | Main responsibility |
| --- | --- |
| `oidc` | Register GitHub Actions as an AWS OIDC identity provider |
| `github_oidc` | Create the GitHub Actions role, trust conditions, and CI/Ansible permissions |
| `iam` | Create the EC2 role and instance profile |
| `ec2` | Create the VPC, public subnet, routing, security group, and instance |
| `ecr` | Create image repositories, scanning configuration, and image retention |
| `parameter_store` | Create SecureString parameter paths for application configuration |
| `ansible_ssm_bucket` | Create the private S3 transfer bucket for Ansible over SSM |

## Ansible responsibilities and current scope

Ansible is split into machine setup and application deployment because these
have different lifecycles.

### Bootstrap playbook

[`ansible/bootstrap.yml`](./ansible/bootstrap.yml) prepares a new Ubuntu
instance. It installs system prerequisites, AWS CLI v2, Docker Engine, the
Docker Compose and Buildx plugins, and the ECR credential helper. It enables
Docker, creates `/opt/devlog`, configures the helper for root's Docker client,
and verifies the installed tools.

The ECR credential helper uses the instance profile's temporary AWS
credentials to authenticate Docker pulls; no static ECR password is written to
the host. Bootstrap is for initial host setup or recovery, not for every code
release.

### Deploy playbook

[`ansible/deploy.yml`](./ansible/deploy.yml) retrieves the runtime parameters,
writes the backend/frontend environment files and Firebase service-account
file, renders the Compose template, pulls the requested images, starts or
updates the services, and prunes old local Docker images. Compose restart
policies allow containers to restart when Docker or the instance restarts.

Ansible connects through the `amazon.aws.aws_ssm` connection plugin. This
avoids requiring SSH for normal management. The instance must be registered
and online in Systems Manager, and the operator/controller needs AWS
permissions plus access to the configured transfer bucket.

The inventory contains the EC2 instance ID and transfer-bucket name, so those
values must be updated when Terraform creates a different instance or bucket.
The Compose template also currently embeds the ECR registry address, and the
playbook/template specify the deployment region directly; these values need
to remain consistent with the Terraform and AWS account/region configuration.

## Image build versus deployment

The current GitHub Actions workflow:

1. Runs on pushes to `main` and can also be started manually.
2. Detects whether backend or frontend paths changed.
3. Assumes the GitHub OIDC role.
4. Builds and pushes only the changed component images, tagged with both
   `latest` and a short commit SHA.
5. Attempts to update ECR-prefixed image tags in the root `compose.yml` and
   pushes that update if the file changed.

The workflow does **not** run `ansible-playbook` or connect to EC2 to apply the
release. Image publication and host deployment are separate operations in the
current setup. The Ansible deployment requires the desired image tags to be
provided to its playbook variables (`backend_tag` and `frontend_tag`).

There is a current image-reference mismatch to be aware of: the workflow's
replacement pattern looks for the AWS ECR registry address, but the checked-in
root `compose.yml` currently uses Docker Hub image references. As written, the
tag-replacement step will not match those current references. The EC2 Compose
file is generated independently from the Ansible template, which already uses
ECR references. A change to one file does not automatically render or deploy
the other.

## Current boundaries and operational considerations

- **Single instance:** EC2, Docker, MongoDB, and Chroma storage share one host.
  There is no automatic horizontal scaling or failover.
- **Persistence is local:** MongoDB's named volume and Chroma's bind mount are
  on the EC2 host. Backups and recovery are not provisioned by the Terraform
  shown here.
- **Public entry point:** the instance has a public IP and accepts HTTP on
  port 80 from anywhere. Port 443 is allowed in the security group, but the
  checked-in Nginx configuration only listens on port 80. HTTPS/TLS termination
  is not provisioned here.
- **SSM is management, not a private subnet:** SSM replaces SSH for Ansible
  access, but the instance remains in a public subnet with outbound internet
  access in this design.
- **Configuration is partly fixed in files:** the SSM region/path, security
  policy parameter path, inventory values, and ECR address in the Ansible
  template must agree with the chosen Terraform variables and AWS account.
- **Deployment is not continuous delivery end-to-end:** CI publishes image
  artifacts but does not execute the Ansible deploy playbook.
- **Destroy behavior matters:** ECR repositories are configured with
  `force_delete = true`, and the Terraform state bucket bootstrap also uses
  `force_destroy = true`. Review the impact before destroying either stack.

These are descriptions of the current implementation, not instructions to
change it. They make explicit where this design trades managed-service
resilience and automation for a smaller, understandable deployment footprint.
