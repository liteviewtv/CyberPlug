# CyberPlug Storefront

A responsive React + Vite storefront with instant product search, category filters, sorting, animated product cards and a lightweight cart interaction.

## Getting started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Optional product API

The storefront ships with a 12-item local catalog in `src/data/products.js`. To load products from an API, set `VITE_PRODUCTS_API_URL` in a local `.env` file:

```env
VITE_PRODUCTS_API_URL=https://your-api.example.com/products
```

The endpoint should return either a JSON array or an object containing a `products` array. Each product can include `id`, `title` (or `name`), `price`, `image` (or `imageUrl`), `category`, `description`, `tags`, and `createdAt`. The local catalog remains available if the request fails.

## Features

- Debounced search across title, description, category and tags
- Category filtering and price/newest sorting
- Responsive 1–4 column product grid
- Framer Motion layout and entrance transitions
- Add-to-bag interaction with live item count and confirmation toast
- Keyboard shortcut: `Ctrl/⌘ + K` focuses search; `Esc` clears it
