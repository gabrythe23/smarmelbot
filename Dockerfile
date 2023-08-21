FROM node:16-alpine as builder

ENV NODE_ENV build

#USER node
WORKDIR /home/node

COPY package*.json ./
RUN npm i -g yarn --force
RUN yarn install --frozen-lockfile

COPY --chown=node:node . .
RUN yarn build
RUN yarn install --production

# ---

FROM node:16-alpine
RUN apk add  --no-cache ffmpeg
ENV NODE_ENV production
WORKDIR /home/node

COPY --from=builder --chown=node:node /home/node/package*.json ./
COPY --from=builder --chown=node:node /home/node/node_modules/ ./node_modules/
COPY --from=builder --chown=node:node /home/node/dist/ ./dist/

CMD ["node", "dist/main.js"]
