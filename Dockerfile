# Akademia Biznesowa Backend - Dockerfile

FROM node:18-alpine

# Ustaw katalog roboczy
WORKDIR /app

# Skopiuj package.json i package-lock.json
COPY package*.json ./

# Zainstaluj zależności
RUN npm install --production

# Skopiuj resztę plików
COPY . .

# Eksponuj port
EXPOSE 5000

# Zdrowie kontenera
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Uruchom aplikację
CMD ["npm", "start"]
