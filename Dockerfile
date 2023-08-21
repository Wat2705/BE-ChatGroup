FROM node:16.16.0-alpine

WORKDIR /chat/backend

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "start"]

# docker build --tag build-nodejs .