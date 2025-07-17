FROM node:18.17.1
 
WORKDIR /app
 
COPY package.json package.json

RUN npm install

RUN apt update

RUN apt install netcat-openbsd

RUN npm install puppeteer

# Installer pdf-lib
RUN npm install pdf-lib

RUN npm install pdf-merger-js

RUN npm install pdfkit axios  @faker-js/faker pg-boss node-cron minio swagger-jsdoc swagger-ui-express jsdom

 # Met à jour le système et installe les outils net-tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libasound2 \
    libnss3 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libx11-6 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    fonts-liberation && \
    rm -rf /var/lib/apt/lists/*


RUN npx puppeteer browsers install chrome

COPY . .

COPY start.sh /usr/src/app/start.sh

RUN chmod +x /usr/src/app/start.sh

# Copy the .env.prod file into the container
COPY .env ./.env

EXPOSE 8000