
FROM node:fermium-buster

WORKDIR /app

ADD package.json /app

RUN npm install

ADD . /app

RUN chown root:root . -R

CMD ["./node_modules/.bin/knex", "migrate:latest"]
