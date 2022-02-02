#Step 1
ARG CODE_VERSION=14.15
FROM node:${CODE_VERSION}-alpine

#Step 2
ENV NODE_ENV production

#Step 3
RUN mkdir -p /usr/src/app

#Step 4
WORKDIR /usr/src/app

#Step 5
COPY package.json .

#Step 6
RUN apk add --no-cache make gcc g++ python

#Step 7
RUN npm install -gq nodemon

#Step 8
RUN npm install -q

#Step 9
COPY . .

#Step 10
EXPOSE 3000

#Step 11
CMD ["npm", "start"]
