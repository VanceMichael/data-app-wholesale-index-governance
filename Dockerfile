FROM node@sha256:5ec23b7c622b00547753bc6ffd78085dd868a68aeb41c8e0a1418f033e13d96d
WORKDIR /app
COPY --chown=node:node package.json package-lock.json ./
USER node
RUN npm ci --ignore-scripts
COPY --chown=node:node . .
CMD ["npm", "run", "check"]
