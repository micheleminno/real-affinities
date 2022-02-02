#Step 1
ARG CODE_VERSION=14.15
FROM node:${CODE_VERSION}-alpine

#Step 2
RUN mkdir -p /usr/src/app

#Step 3
WORKDIR /usr/src/app

#Step 4
COPY package.json .

#Step 5
RUN npm install -q

#Step 6
COPY . .

#Step 7
EXPOSE 4200

#Step 8
CMD ["npm", "start"]
