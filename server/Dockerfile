FROM node:12-alpine

RUN mkdir /app/

WORKDIR /app/

RUN apk add --no-cache bash

RUN npm i @babel/core -g

COPY package.json /app/

COPY package-lock.json /app/

COPY babel.config.json /app/

RUN npm i

COPY ./src /app/src

RUN mkdir /app/build/

RUN npm run compile

RUN mkdir /app_data/

COPY wait-for-it.sh /app/wait-for-it.sh

RUN chmod +x /app/wait-for-it.sh
