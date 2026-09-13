resource "aws_iam_role" "github_actions" {
  name = var.role_name
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
            Federated = var.oidc_provider_arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"

            "token.actions.githubusercontent.com:sub" = "repo:${var.github_owner}/${var.github_repository}:ref:refs/heads/${var.github_branch}"
          }
        }
      }
    ]
  })
}

resource "aws_iam_policy" "ecr_push" {
  name = "${var.role_name}-ECRPush"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:CompleteLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:InitiateLayerUpload",
          "ecr:PutImage",
          "ecr:BatchGetImage"
        ]
        Resource = var.ecr_repository_arns
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "github" {
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.ecr_push.arn
}

resource "aws_iam_policy" "github_ssm" {
  name = "${var.role_name}-SSM"

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Action = [
          "ssm:StartSession",
          "ssm:TerminateSession",
          "ssm:ResumeSession",
          "ssm:DescribeInstanceInformation"
        ]

        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "github_ssm" {
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.github_ssm.arn
}

resource "aws_iam_policy" "github_ansible_ssm_s3" {
  name = "${var.role_name}-AnsibleSSM-S3"

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Action = [
          "s3:ListBucket",
          "s3:GetBucketLocation"
        ]

        Resource = var.ansible_ssm_bucket_arn
      },
      {
        Effect = "Allow"

        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]

        Resource = "${var.ansible_ssm_bucket_arn}/*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "github_ansible_ssm_s3" {
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.github_ansible_ssm_s3.arn
}