const express = require('express');
const { supabase } = require('../supabaseClient');
const { createPaginationMetadata, normalizePagination } = require('../utils/productUtils');
const { seedProducts } = require('../seedProducts');

const router = express.Router();

async function applyFilters(queryBuilder, query) {
  let builder = queryBuilder;

  if (query.category) {
    builder = builder.eq('category', query.category);
  }

  if (query.brand) {
    builder = builder.eq('brand', query.brand);
  }

  if (query.status) {
    builder = builder.eq('status', query.status);
  }

  if (query.active !== undefined) {
    builder = builder.eq('is_active', query.active === 'true');
  }

  return builder;
}

router.get('/', async (req, res) => {
  try {
    const { page, limit, usePagination } = normalizePagination(req.query);
    let query = supabase.from('products').select('*', { count: 'exact' }).order('created_at', { ascending: false });
    query = await applyFilters(query, req.query);

    if (usePagination) {
      query = query.range((page - 1) * limit, page * limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const pagination = usePagination ? createPaginationMetadata(page, limit, count || data.length) : null;

    return res.json({ data, pagination });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const term = req.query.q?.trim();

    if (!term) {
      return res.status(400).json({ error: 'The q query parameter is required.' });
    }

    const { page, limit, usePagination } = normalizePagination(req.query);
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .or(`name.ilike.%${term}%,description.ilike.%${term}%,sku.ilike.%${term}%`)
      .order('created_at', { ascending: false });

    query = await applyFilters(query, req.query);

    if (usePagination) {
      query = query.range((page - 1) * limit, page * limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const pagination = usePagination ? createPaginationMetadata(page, limit, count || data.length) : null;

    return res.json({ data, pagination });
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
