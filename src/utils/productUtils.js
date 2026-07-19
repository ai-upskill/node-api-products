function buildProductRecord(index) {
  const paddedIndex = String(index).padStart(6, '0');
  const categoryPool = ['Electronics', 'Furniture', 'Apparel', 'Home', 'Industrial'];
  const brandPool = ['Acme', 'Northwind', 'Globex', 'Initech', 'Umbrella'];
  const warehousePool = ['AUS-01', 'EU-03', 'US-06', 'APAC-02'];
  const category = categoryPool[(index - 1) % categoryPool.length];
  const brand = brandPool[(index - 1) % brandPool.length];
  const price = Number((Math.round((50 + (index % 2500) * 1.75 + (index % 11) * 0.25) * 100) / 100).toFixed(2));
  const costPrice = Number((price * 0.72).toFixed(2));

  return {
    sku: `SKU-${paddedIndex}`,
    name: `${brand} ${category} ${paddedIndex}`,
    description: `${category} item ${paddedIndex}`,
    category,
    brand,
    price,
    cost_price: costPrice,
    currency: 'USD',
    stock_quantity: 100 + (index % 500),
    stock_status: index % 7 === 0 ? 'low_stock' : 'in_stock',
    weight_kg: Number((1 + (index % 20) * 0.35).toFixed(2)),
    dimensions_cm: {
      l: 10 + (index % 8),
      w: 8 + (index % 6),
      h: 3 + (index % 5)
    },
    tags: [category.toLowerCase(), brand.toLowerCase()],
    is_active: true,
    is_featured: index % 13 === 0,
    rating: Number((3.5 + (index % 6) * 0.5).toFixed(1)),
    review_count: 20 + (index % 180),
    metadata: {
      src: 'node',
      inv: index % 3 === 0 ? 'A' : 'B'
    },
    supplier_id: `S${String(index % 1000).padStart(3, '0')}`,
    warehouse: warehousePool[index % warehousePool.length],
    gtin: `GTIN-${paddedIndex}`,
    mpn: `MPN-${paddedIndex}`,
    barcode: `BAR-${paddedIndex}`,
    tax_code: 'TX-001',
    status: 'active',
    image_url: `https://img/${paddedIndex}`,
    slug: `p-${paddedIndex}`,
    unit: 'each',
    min_order_quantity: 1,
    max_order_quantity: 1000,
    lead_time_days: 1 + (index % 7),
    created_by: 'seed-script'
  };
}

function normalizePagination(query = {}) {
  const hasPage = Object.prototype.hasOwnProperty.call(query, 'page');
  const hasLimit = Object.prototype.hasOwnProperty.call(query, 'limit');
  const usePagination = hasPage || hasLimit;

  const page = Math.max(1, Number.parseInt(query.page || '1', 10) || 1);
  let limit = Math.max(1, Number.parseInt(query.limit || '50', 10) || 50);
  const maxLimit = 100;

  if (limit > maxLimit) {
    limit = maxLimit;
  }

  return { page, limit, usePagination };
}

function createPaginationMetadata(page, limit, total) {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  };
}

module.exports = {
  buildProductRecord,
  normalizePagination,
  createPaginationMetadata
};
