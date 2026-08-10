output "instance_id" {

  value = aws_instance.server.id

}

# output "public_ip" {

#   value = aws_eip.server.public_ip

# }

# output "public_dns" {

#   value = aws_instance.server.public_dns

# }

output "security_group_id" {

  value = aws_security_group.ec2.id

}