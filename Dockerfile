FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build
# Using esbuild or tsx for compiling standard files doesn't exist, we rely on Node's native strip types

ENV NODE_ENV=production

# Render sets PORT env var automatically, so we don't hardcode it here
# EXPOSE is still useful as documentation
EXPOSE 3000

CMD ["npm", "start"]
