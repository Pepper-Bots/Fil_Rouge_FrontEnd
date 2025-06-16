# Étape 1, basée sur Node.js pour construire et compiler l'application Angular
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape 2, basée sur Nginx pour avoir uniquement le contenu compilé pour servir avec Nginx
FROM nginx:1.27-alpine
COPY --from=build /app/dist/cda_2025_front /usr/share/nginx/html
COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf
