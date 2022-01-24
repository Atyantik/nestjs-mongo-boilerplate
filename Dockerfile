FROM node:14

ENV UID=1000
ENV GID=1000

WORKDIR /app/

RUN apt-get update -y && apt-get upgrade -y && apt-get install -y \
    fonts-liberation \
    gconf-service \
    libappindicator1 \
    libasound2 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libfontconfig1 \
    libgbm-dev \
    libgdk-pixbuf2.0-0 \
    libgtk-3-0 \
    libicu-dev \
    libjpeg-dev \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libpng-dev \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    xdg-utils

COPY . /app/

RUN rm -rf node_modules  package-lock.json > /dev/null 2>&1

RUN NODE_ENV=development npm install && npm run build && NODE_ENV=production npm prune --production

RUN chmod -R o+rwx node_modules/puppeteer/.local-chromium


CMD ["npm", "run", "start:prod"]
