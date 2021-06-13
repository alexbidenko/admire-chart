FROM node:15-alpine as build
WORKDIR /app
COPY . ./
RUN yarn install
RUN yarn build

FROM nginx:stable-alpine
COPY --from=build /app/build /var/www/html
COPY .nginx/nginx.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]
