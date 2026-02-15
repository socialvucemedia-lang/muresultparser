# Deployment Guide

## 1. Deploy FastAPI Parser to Vercel

```bash
cd parser-api
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? (choose your account)
- Link to existing project? **N**
- Project name? `mu-parser-api` (or your choice)
- Directory? `./`
- Override settings? **N**

This will give you a URL like: `https://mu-parser-api.vercel.app`

For production deployment:
```bash
vercel --prod
```

## 2. Set Environment Variable in Next.js App

On Vercel dashboard for your Next.js app:
1. Go to Project Settings → Environment Variables
2. Add new variable:
   - **Name**: `PARSER_API_URL`
   - **Value**: `https://your-parser-api-url.vercel.app` (from step 1)
   - **Environment**: Production (and Preview if needed)
3. Save

Or add to `.env.local` for local development:
```bash
PARSER_API_URL=https://your-parser-api-url.vercel.app
```

## 3. Redeploy Next.js App

```bash
git add .
git commit -m "Add privacy page and env config"
git push origin main
```

Vercel will auto-deploy with the new environment variable.

## 4. Test

Visit your deployed Next.js app and try uploading a PDF. The `/api/parse` endpoint should now work!

## Troubleshooting

- **400 Error on /api/parse**: FastAPI service not deployed or environment variable not set
- **404 on /privacy**: Route file not committed/pushed
- **CORS errors**: Update CORS origins in `parser-api/api/index.py`
