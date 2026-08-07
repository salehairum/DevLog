data "aws_ami" "ubuntu" {
  most_recent = true
  owners = ["099720109477"]
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

resource "aws_security_group" "ec2" {

  name = "${var.project_name}-sg"

  description = "DevLog Security Group"

  vpc_id = data.aws_vpc.default.id

  ingress {

    from_port = 80
    to_port   = 80
    protocol  = "tcp"

    cidr_blocks = ["0.0.0.0/0"]

  }

  ingress {

    from_port = 443
    to_port   = 443
    protocol  = "tcp"

    cidr_blocks = ["0.0.0.0/0"]

  }

  dynamic "ingress" {

    for_each = var.allowed_ssh_cidr == null ? [] : [1]

    content {

      from_port = 22
      to_port   = 22
      protocol  = "tcp"

      cidr_blocks = [var.allowed_ssh_cidr]

    }

  }

  egress {

    from_port = 0
    to_port   = 0
    protocol  = "-1"

    cidr_blocks = ["0.0.0.0/0"]

  }

}

resource "aws_instance" "server" {

  ami = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  subnet_id = data.aws_subnets.default.ids[0]
  vpc_security_group_ids = [
    aws_security_group.ec2.id
  ]
  iam_instance_profile = var.iam_instance_profile
  key_name = var.key_name
  tags = {
    Name = "${var.project_name}-server"
  }
}

resource "aws_eip" "server" {
  domain = "vpc"
  instance = aws_instance.server.id
}