FROM node:8.1.4-alpine

EXPOSE 3000
ENV NODE_ENV production
RUN mkdir /app
WORKDIR /app


# add package.json and run npm install before adding the rest of the files
# this way, you only run npm install when package.json changes
ADD /web-server/package.json /app/package.json

# add the rest of the files
ADD web-server /app

RUN apk add --no-cache make gcc g++ python

RUN npm install -gq mocha
RUN npm install -q

# add the rest of the files
ADD . /app

CMD ["web-server/node_modules/.bin/nodemon", "web-server/server/Server.js"]

# to run app
# docker-compose -f docker-compose.yml -p ci up --build
