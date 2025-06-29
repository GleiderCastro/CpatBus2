# web/Dockerfile
FROM node:18-alpine AS build
WORKDIR /app

# 1) Copia solo package.json
COPY package.json ./

# 2) Instala dependencias sin package-lock.json
RUN npm install

# 3) Copia el resto del código
COPY . .

# 4) Genera la versión de producción
RUN npm run build

# 5) Sirve con Nginx
FROM nginx:stable-alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/build /usr/share/nginx/html
# Copia la configuración personalizada de nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

