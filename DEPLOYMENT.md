# Dealbuzz Deployment Guide

## Prerequisites
- Node.js v22+
- MongoDB instance (Atlas or self-hosted)
- Docker (optional but recommended for production)

## Step-by-Step Setup

### Step 1: Environment Variables
Create a `.env` file in the root directory based on `.env.example`:

```env
MONGODB_URI="mongodb+srv://<user>:<password>@cluster0.mongodb.net/dealbuzz?retryWrites=true&w=majority"
JWT_SECRET="your_very_secure_jwt_secret_key"
VITE_API_URL="/api"
PORT=3000
```

### Step 2: Running with Docker (Preferred)

Build the image:
```bash
docker build -t dealbuzz .
```

Run the container:
```bash
docker run -p 3000:3000 --env-file .env dealbuzz
```

### Step 3: Running Manually on VPS (e.g. Ubuntu + PM2)

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Build the frontend for production:
```bash
npm run build
```

3. Setup PM2 to run the Express backend:
```bash
npm install -g pm2
pm2 start npm --name "dealbuzz" -- run start
```

### Important Notes
- Ensure your MongoDB connection allows access from the IP of your hosting server.
- The `node --experimental-strip-types server.ts` script runs the backend with Node's native TypeScript support. Ensure your Node environment resolves `.js` appropriately. You can use `npx tsx server.ts` if on earlier Node versions.
- The app uses role-based access. Registering a tenant automatically provisions the first user as `admin` who can then invite other users.
