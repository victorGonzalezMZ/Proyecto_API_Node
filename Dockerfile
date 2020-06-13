FROM node AS builder

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app

RUN npm install
RUN $(npm bin)/npm run

FROM nginx
WORKDIR /usr/share/nginx/html/
COPY --from=builder /usr/src/app/dist/app-fondos-gto/ /usr/share/nginx/html
EXPOSE 3000

CMD nginx -g 'daemon off;'

