#Step 1
FROM node:8.1.4-alpine

#Step 2
RUN mkdir -p /usr/src/app

#Step 3
WORKDIR /usr/src/app

#Step 4
COPY package.json /usr/src/app

#Step 5
RUN apk add --no-cache make gcc g++ python

#Step 6
RUN npm install -gq mocha

#Step 7
RUN npm install -q

#Step 8
COPY . /usr/src/app

#Step 9
EXPOSE 3000

#Step 10
CMD ["./node_modules/.bin/nodemon", "./server/server.js"]
