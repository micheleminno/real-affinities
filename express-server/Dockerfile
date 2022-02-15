
FROM ubuntu:16.04

USER root

RUN apt-get update
RUN apt-get -qq update
RUN apt-get install -y build-essential
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash
RUN apt-get install -y nodejs

ENV NODE_ENV production

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json .

RUN apt-get install make gcc g++ python

RUN npm install -gq nodemon

RUN npm install -q

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
