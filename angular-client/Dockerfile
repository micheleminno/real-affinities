
FROM node:fermium-buster

USER root

RUN apt-get update

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json .

RUN npm install -q

COPY . .

EXPOSE 4200

CMD ["npm", "start"]
