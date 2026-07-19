const { supabase } = require('./supabaseClient');
const { client } = require('./opensearchClient');
const dotenv = require('dotenv');

dotenv.config();

async function ensureIndex() {
  const index = 'products';
  const exists = await client.indices.exists({ index });
  if (!exists.body) {
    await client.indices.create({
      index,
      body: {
        mappings: {
          properties: {
            name: { type: 'text', fields: { keyword: { type: 'keyword' } } },
            description: { type: 'text' },
            category: { type: 'keyword' },
            brand: { type: 'keyword' },
            sku: { type: 'keyword' },
            price: { type: 'double' },
            created_at: { type: 'date' }
          }
        }
      }
    });
  }
}

async function indexBatch(offset = 0, batchSize = 1000) {
  const from = offset;
  const to = offset + batchSize - 1;
  const { data, error } = await supabase.from('products').select('*').range(from, to);
  if (error) throw error;
  if (!data || data.length === 0) return 0;

  const body = [];
  data.forEach((doc) => {
    body.push({ index: { _index: 'products', _id: doc.id } });
    body.push({
      name: doc.name,
      description: doc.description,
      category: doc.category,
      brand: doc.brand,
      sku: doc.sku,
      price: doc.price,
      created_at: doc.created_at,
      metadata: doc.metadata
    });
  });

  const { body: resp } = await client.bulk({ refresh: true, body });
  if (resp.errors) {
    console.error('Bulk index errors', resp.items.filter(i => Object.values(i)[0].error));
    throw new Error('Bulk index failure');
  }

  return data.length;
}

async function indexAll({ batchSize = 1000, start = 0, limitCount } = {}) {
  await ensureIndex();
  let offset = start;
  let totalIndexed = 0;
  while (true) {
    const added = await indexBatch(offset, batchSize);
    if (added === 0) break;
    offset += added;
    totalIndexed += added;
    console.log(`Indexed ${totalIndexed} items`);
    if (limitCount && totalIndexed >= limitCount) break;
  }
  return totalIndexed;
}

if (require.main === module) {
  const batchSize = Number.parseInt(process.argv[2] || process.env.BATCH_SIZE || '1000', 10);
  const limitCount = process.argv[3] ? Number.parseInt(process.argv[3], 10) : undefined;
  indexAll({ batchSize, limitCount })
    .then((count) => console.log(`Finished indexing ${count} documents`))
    .catch((err) => {
      console.error(err.message || err);
      process.exit(1);
    });
}

module.exports = { indexAll };
