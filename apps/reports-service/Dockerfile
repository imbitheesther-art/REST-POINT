FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 8014
ENV PORT=8014
CMD ["node", "server.js"]
