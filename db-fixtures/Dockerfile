FROM node:8.1.4-alpine

WORKDIR /app

# add package.json and run npm install before adding the rest of the files
# this way, you only run npm install when package.json changes
ADD package.json /app
RUN npm install

# add the rest of the files
ADD . /app

# ENV NODE_ENV development

CMD ["./node_modules/.bin/knex", "seed:run"]
