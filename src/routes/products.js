const express = require('express');
const { supabase } = require('../supabaseClient');
const { buildSearchRequest, createPaginationMetadata } = require('../utils/productUtils');
const { seedProducts } = require('../seedProducts');

const router = express.Router();

async function applyFilters(queryBuilder, request) {
  let builder = queryBuilder;

  if (request.q) {
    builder = builder.or(`name.ilike.%${request.q}%,description.ilike.%${request.q}%,sku.ilike.%${request.q}%,brand.ilike.%${request.q}%`);
  }

  if (request.name) {
    builder = builder.ilike('name', `%${request.name}%`);
  }

  if (request.category) {
    builder = builder.eq('category', request.category);
  }

  if (request.brand) {
    builder = builder.eq('brand', request.brand);
  }

  if (request.sku) {
    builder = builder.eq('sku', request.sku);
  }

  if (request.status) {
    builder = builder.eq('status', request.status);
  }

  if (request.active !== undefined) {
    builder = builder.eq('is_active', request.active);
  }

  if (request.minPrice !== undefined) {
    builder = builder.gte('price', request.minPrice);
  }

  if (request.maxPrice !== undefined) {
    builder = builder.lte('price', request.maxPrice);
  }

  if (request.type) {
    builder = builder.or(`type.eq.${request.type},metadata->type.eq.${request.type}`);
  }

  const sortBy = request.sortBy === 'name' ? 'name' : request.sortBy === 'price' ? 'price' : 'created_at';
  builder = builder.order(sortBy, { ascending: request.sortOrder === 'asc' });

  return builder;
}

async function runQuery(req, res, request) {
  const { page, limit, usePagination } = request.pagination;
  let query = supabase.from('products').select('*', { count: 'exact' });
  query = await applyFilters(query, request);

  if (usePagination) {
    query = query.limit(limit).offset((page - 1) * limit);
  }

  const { data, error, count } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const pagination = usePagination ? createPaginationMetadata(page, limit, count || data.length) : null;

  return res.json({ data, pagination });
}

router.get('/', async (req, res) => {
  try {
    return runQuery(req, res, buildSearchRequest(req.query));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    return runQuery(req, res, buildSearchRequest(req.query));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('*').eq('id', req.params.id).single();

    if (error) {
      return res.status(404).json({ error: error.message });
    }

    return res.json({ data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').insert(req.body).select().single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({ data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').update(req.body).eq('id', req.params.id).select().single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('products').delete().eq('id', req.params.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ success: true, id: req.params.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/seed', async (req, res) => {
  try {
    const count = Number.parseInt(req.query.count || req.body.count || '1000000', 10);
    const batchSize = Number.parseInt(req.query.batchSize || req.body.batchSize || '1000', 10);

    if (Number.isNaN(count) || count < 1 || Number.isNaN(batchSize) || batchSize < 1) {
      return res.status(400).json({ error: 'count and batchSize should be positive integers.' });
    }

    const result = await seedProducts({ count, batchSize });
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
