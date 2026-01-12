# Dockerfile pour Blockchain (Hardhat local node)
FROM node:18-alpine

WORKDIR /app

# ... étapes précédentes ...
COPY package*.json ./

# Augmenter le timeout et les tentatives de npm
RUN npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 5 && \
    npm install

# Installer les dépendances
RUN npm install

# Copier le reste du code
COPY . .

# Exposer le port Hardhat
EXPOSE 8545

# Démarrer le nœud Hardhat local
CMD ["npx", "hardhat", "node"]