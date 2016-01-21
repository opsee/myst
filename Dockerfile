FROM node:argon

MAINTAINER Sara Bee <sara@opsee.co>

ENV NODE_ENV 'production'

RUN mkdir -p /opt/bin && curl -Lo /opt/bin/s3kms https://s3-us-west-2.amazonaws.com/opsee-releases/go/vinz-clortho/s3kms-linux-amd64 && \
    chmod 755 /opt/bin/s3kms

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app

ENV APPENV "mystenv"
ENV INTERCOM_API_KEY ""

# Start the server
EXPOSE 9098
ENTRYPOINT ["./run.sh"]