# Node alap – node biztosan elérhető
FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-pip curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY requirements.txt ./
RUN pip3 install --break-system-packages --no-cache-dir -r requirements.txt

COPY . .

RUN npm run build

ENV API_BACKEND=http://127.0.0.1:8000

EXPOSE 3000

CMD ["/bin/sh", "-c", "python3 -m uvicorn server:app --host 0.0.0.0 --port 8000 & exec node scripts/serve.js"]
