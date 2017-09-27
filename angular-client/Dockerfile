#Step 1
FROM node:8.1.4-alpine

#Step 2
RUN mkdir -p /usr/src/app

#Step 3
WORKDIR /usr/src/app

#Step 4
COPY package.json /usr/src/app

#Step 5
RUN npm install -q

#Step 6
COPY . /usr/src/app

#Step 7
EXPOSE 4200

#Step 8
CMD ["npm", "start"]
