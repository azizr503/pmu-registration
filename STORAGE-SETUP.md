# Storage Setup for Production

## Current Solution (Working on Vercel)

The application now uses **in-memory storage** which works on Vercel's serverless functions. This is suitable for demo purposes but has limitations:

### ✅ Pros:
- Works immediately on Vercel
- No additional setup required
- No external dependencies

### ⚠️ Limitations:
- Data resets when server restarts (Vercel functions restart periodically)
- Not suitable for production with many users
- Data is not persistent across deployments

## Production Storage Options

### Option 1: Vercel KV (Recommended for Vercel)
```bash
# Install Vercel KV
npm install @vercel/kv

# Add to your environment variables
KV_REST_API_URL=your-kv-url
KV_REST_API_TOKEN=your-kv-token
KV_REST_API_READ_ONLY_TOKEN=your-readonly-token
```

### Option 2: MongoDB Atlas (Free Tier Available)
```bash
# Install MongoDB driver
npm install mongodb

# Add to your environment variables
MONGODB_URI=your-mongodb-connection-string
```

### Option 3: PostgreSQL with Vercel Postgres
```bash
# Install Postgres driver
npm install @vercel/postgres

# Add to your environment variables
POSTGRES_URL=your-postgres-url
```

### Option 4: JSONBin.io (Simple JSON Storage)
```bash
# Add to your environment variables
JSONBIN_API_KEY=your-api-key
JSONBIN_BIN_ID=your-bin-id
```

## Quick Setup for JSONBin.io (Easiest)

1. Go to [jsonbin.io](https://jsonbin.io)
2. Create a free account
3. Create a new bin with an empty array: `[]`
4. Get your API key from the dashboard
5. Add these environment variables to Vercel:
   - `JSONBIN_API_KEY=your-api-key`
   - `JSONBIN_BIN_ID=your-bin-id`

## Migration Steps

To migrate from in-memory storage to persistent storage:

1. Choose your preferred storage option
2. Update `lib/auth.ts` to use the new storage functions
3. Add environment variables to Vercel
4. Deploy and test

## Current Demo Data

The system includes one demo user:
- **Email**: aziz.saleh@pmu.edu.sa
- **Password**: (use the original password you set)
- **Student ID**: 20256341

This user will be available for testing the admin dashboard and authentication flow.
