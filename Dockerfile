FROM node:22-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm ci --omit=dev

RUN npm run build

CMD ["node", "dist/main"]