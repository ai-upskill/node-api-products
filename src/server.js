const express = require('express');
const dotenv = require('dotenv');
const productsRouter = require('./routes/products');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/products', productsRouter);

app.listen(port, () => {
  console.log(`Products service listening on port ${port}`);
});
