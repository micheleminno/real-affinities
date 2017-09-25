#!/bin/bash

ssh -T -i "~/.ssh/MyServer.pem" ubuntu@ec2-18-220-103-149.us-east-2.compute.amazonaws.com << EOF

docker-compose -f docker-compose.yml -p ci up --build
EOF
