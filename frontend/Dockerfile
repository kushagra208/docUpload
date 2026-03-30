FROM node:25.8.2-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:25.8.2-alpine

WORKDIR /app

RUN npm install -g http-server

COPY --from=build /app/dist /app/dist

EXPOSE 3000

CMD ["http-server", "dist", "-p", "3000", "-c-1"]
