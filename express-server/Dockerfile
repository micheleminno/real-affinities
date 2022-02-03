
FROM node:fermium-buster

USER root

RUN apt-get update

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
