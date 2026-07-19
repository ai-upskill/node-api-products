const test = require('node:test');
const assert = require('node:assert/strict');
const { buildProductRecord, normalizePagination, createPaginationMetadata, buildSearchRequest } = require('../src/utils/productUtils');

test('buildProductRecord returns enterprise fields and a deterministic SKU', () => {
  const record = buildProductRecord(1);

  assert.equal(record.sku, 'SKU-000001');
  assert.equal(record.category, 'Electronics');
  assert.ok(record.metadata);
  assert.equal(record.status, 'active');
  assert.ok(Array.isArray(record.tags));
  assert.equal(record.tags[0], 'electronics');
});

test('normalizePagination defaults to a non-paginated request', () => {
  const pagination = normalizePagination({});

  assert.equal(pagination.page, 1);
  assert.equal(pagination.limit, 50);
  assert.equal(pagination.usePagination, false);
});

test('createPaginationMetadata calculates the next and previous page state', () => {
  const metadata = createPaginationMetadata(2, 20, 95);

  assert.equal(metadata.totalPages, 5);
  assert.equal(metadata.hasNextPage, true);
  assert.equal(metadata.hasPreviousPage, true);
});

test('buildSearchRequest normalizes filters and pagination values', () => {
  const request = buildSearchRequest({
    q: 'laptop',
    name: 'Laptop',
    category: 'Electronics',
    brand: 'Acme',
    type: 'physical',
    status: 'active',
    active: 'true',
    minPrice: '100',
    maxPrice: '500',
    page: '2',
    limit: '10',
    sortBy: 'price',
    sortOrder: 'asc'
  });

  assert.equal(request.q, 'laptop');
  assert.equal(request.name, 'Laptop');
  assert.equal(request.category, 'Electronics');
  assert.equal(request.brand, 'Acme');
  assert.equal(request.type, 'physical');
  assert.equal(request.active, true);
  assert.equal(request.minPrice, 100);
  assert.equal(request.maxPrice, 500);
  assert.equal(request.pagination.page, 2);
  assert.equal(request.pagination.limit, 10);
  assert.equal(request.sortBy, 'price');
  assert.equal(request.sortOrder, 'asc');
});
