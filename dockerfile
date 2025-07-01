# Utiliser l'image officielle Node.js
FROM node:lts

# Définir le répertoire de travail
WORKDIR /usr/src/app

EXPOSE 3000

ENTRYPOINT npm install && npm run dev