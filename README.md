# Supabase Products Service

This project provides a Node.js service for:

- seeding up to 1,000,000 product records into a Supabase PostgreSQL table
- CRUD endpoints for products
- search with optional pagination

## Quick start

1. Create the table in Supabase using the SQL in [sql/products.sql](sql/products.sql).
2. Copy [.env.example](.env.example) to .env and fill in your Supabase credentials.
3. Install dependencies:

```bash
npm install
```

4. Run the API:

```bash
npm start
```

## Seed 1 million products

```bash
npm run seed -- --count=1000000 --batch-size=1000
```

## API examples

### List products

```bash
curl http://localhost:3000/api/products?page=1&limit=20
```

### Search products

```bash
curl "http://localhost:3000/api/products/search?q=laptop&page=1&limit=20"
```

### Create a product

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"sku":"SKU-1000001","name":"Enterprise Laptop","category":"Electronics","brand":"Acme","price":1299.99,"currency":"USD","stock_quantity":25,"description":"High-performance business laptop"}'
```

### Update a product

```bash
curl -X PUT http://localhost:3000/api/products/<id> \
  -H "Content-Type: application/json" \
  -d '{"price":1399.99}'
```

### Delete a product

```bash
curl -X DELETE http://localhost:3000/api/products/<id>
```
