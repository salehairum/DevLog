FROM node:18-alpine AS build

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY env.sh /usr/local/bin/env.sh
RUN chmod +x /usr/local/bin/env.sh

ENTRYPOINT ["/usr/local/bin/env.sh"]

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
