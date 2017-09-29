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
RUN npm install -q

#Step 7
COPY . /usr/src/app

#Step 8
EXPOSE 3000

#Step 9
CMD ["./node_modules/.bin/nodemon", "./server/server.js"]
