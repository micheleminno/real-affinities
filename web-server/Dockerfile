FROM node:8.1.4-alpine

EXPOSE 3000
ENV NODE_ENV production
RUN mkdir /web-server

# add package.json and run npm install before adding the rest of the files
# this way, you only run npm install when package.json changes
COPY web-server/package.json web-server/package.json

WORKDIR /web-server

RUN apk add --no-cache make gcc g++ python

RUN npm install -gq mocha
RUN npm install -q

# add the rest of the files
COPY web-server /web-server


# to run app
# docker-compose -f docker-compose.yml -p ci up --build
