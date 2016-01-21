FROM node:argon

MAINTAINER Sara Bee <sara@opsee.co>

ENV NODE_ENV 'production'

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app

ENV APPENV="mystenv"
ENV INTERCOM_API_KEY=""


# Start the server
EXPOSE 9098
ENTRYPOINT ["node", "server.js"]