resource "aws_ecr_repository" "frontend" {
  name = "frontend-repo"
}

resource "aws_ecr_repository" "backend" {
  name = "backend-repo"
}

resource "terraform_data" "build_and_push_backend" {
  provisioner "local-exec" {
    command = <<EOT
      cd ../back-end
      aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${aws_ecr_repository.backend.repository_url}
      docker build -t ${aws_ecr_repository.backend.repository_url}:latest .
      docker push ${aws_ecr_repository.backend.repository_url}:latest
    EOT
  }
  depends_on = [aws_ecr_repository.backend]
}

resource "terraform_data" "build_and_push_frontend" {
  provisioner "local-exec" {
    command = <<EOT
      cd ../front-end
      aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${aws_ecr_repository.frontend.repository_url}
      docker build -t ${aws_ecr_repository.frontend.repository_url}:latest --build-arg NEXT_PUBLIC_API_URL=${aws_lb.backend_lb.dns_name} .
      docker push ${aws_ecr_repository.frontend.repository_url}:latest
    EOT
  }
  depends_on = [aws_ecr_repository.frontend, aws_lb.backend_lb]
}
