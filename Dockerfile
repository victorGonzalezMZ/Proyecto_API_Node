FROM node AS builder

WORKDIR /api_node
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm","start"]