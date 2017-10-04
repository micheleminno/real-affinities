# Step 1
FROM node:8.1.4-alpine

# Step 2
WORKDIR /app

# Step 3
ADD package.json /app

# Step 4
RUN npm install

# Step 5
ADD . /app

# Step 6
RUN chown root:root . -R

# Step 7
CMD ["./node_modules/.bin/knex", "migrate:latest"]
