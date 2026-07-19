const test = require('node:test');
const assert = require('node:assert/strict');
const { buildProductRecord, normalizePagination, createPaginationMetadata } = require('../src/utils/productUtils');

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
