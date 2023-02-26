FROM node:14-alpine

ARG MONGO_URI
ARG JWT_PRIVATE_KEY

ENV MONGO_URI=$MONGO
ENV JWT_PRIVATE_KEY=$JWT_PRIVATE_KEY

WORKDIR "/"

COPY package.json ./

RUN npm install --production

EXPOSE 3000

CMD npm run start