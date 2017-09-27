FROM node:8.1.4-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json /usr/src/app


RUN apk add --no-cache make gcc g++ python

RUN npm install -gq mocha
RUN npm install -q

COPY . /usr/src/app

EXPOSE 3000

CMD ["npm", "start"]
