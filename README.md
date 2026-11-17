# CyberPlug Storefront

A general-purpose React + Vite storefront with a private product administration area and Cloudflare Pages Functions API.

## Cloudflare setup required

The frontend deploys from GitHub to Cloudflare Pages. The admin API requires a Cloudflare D1 database, an R2 bucket for image uploads, and two secrets.

### 1. Create the D1 database
In Cloudflare Dashboard, open **Workers & Pages → D1 SQL Database**, create a database named `cyberplug-db`, then open its **Console** and execute the SQL in `migrations/0001_create_products.sql`.

Add a D1 binding to the Pages project:
- Variable name: `DB`
- Select the `cyberplug-db` database.

### 2. Create image storage
Create an R2 bucket named `cyberplug-images`. Add an R2 bucket binding to the Pages project:
- Variable name: `IMAGES`
- Select the `cyberplug-images` bucket.

### 3. Add admin secrets
In **Workers & Pages → cyberplug → Settings → Variables and Secrets**, add these as encrypted secrets:
- `ADMIN_PASSWORD`: choose a strong, unique admin password.
- `SESSION_SECRET`: generate a long random secret (at least 32 characters).

Save the settings and trigger a new deployment. Do not put either secret in frontend environment variables or commit them to GitHub.

## Admin

Visit `/admin` on the deployed site. Sign in with `ADMIN_PASSWORD` to create, edit, publish, draft, feature, or delete products. Product fields include image, description, selling and compare-at prices in NGN, category, SKU, tags, stock count and visibility. Images can be uploaded directly (up to 5 MB) after the R2 binding is configured, or supplied by URL.

Public catalogue endpoints expose published products only. Admin endpoints require a signed, HttpOnly session cookie.

## Local development

```bash
npm install
npm run dev
```

The admin API depends on Cloudflare Pages Functions bindings and will not operate in a plain Vite dev server without a Cloudflare local runtime.
