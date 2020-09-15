FROM node:14-alpine

ARG CFPACK_VERSION

ENV CFPACK_VERSION $CFPACK_VERSION
ENV NODE_ENV production

RUN npm i -g "cfpack.js@${CFPACK_VERSION}" && \
    npm cache clean --force

WORKDIR /var/cfpack

ENTRYPOINT [ "cfpack" ]
