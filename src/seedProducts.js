const { supabase } = require('./supabaseClient');
const { buildProductRecord } = require('./utils/productUtils');

function parseArgValue(flag, fallback) {
  const flagIndex = process.argv.findIndex((arg) => arg.startsWith(`${flag}=`));

  if (flagIndex >= 0) {
    return Number.parseInt(process.argv[flagIndex].split('=').slice(1).join('='), 10);
  }

  const explicitFlagIndex = process.argv.indexOf(flag);

  if (explicitFlagIndex >= 0 && process.argv[explicitFlagIndex + 1]) {
    return Number.parseInt(process.argv[explicitFlagIndex + 1], 10);
  }

  return Number.parseInt(fallback, 10);
}

async function seedProducts({ count = 1_000_00, batchSize = 1000, startAt = 1 } = {}) {
  const total = Math.max(1, Number.parseInt(count, 10) || 1_000_00);
  const size = Math.max(1, Number.parseInt(batchSize, 10) || 1000);
  const start = Math.max(1, Number.parseInt(startAt, 10) || 1);
  let inserted = 0;
  let currentIndex = start;

  if (start > 1) {
    console.log(`Resuming from product index ${start}`);
  }

  for (let offset = 0; offset < total; offset += size) {
    const currentBatchSize = Math.min(size, total - offset);
    const payload = Array.from({ length: currentBatchSize }, () => {
      const record = buildProductRecord(currentIndex);
      currentIndex += 1;
      return record;
    });

    const { error } = await supabase.from('products').insert(payload);

    if (error) {
      throw error;
    }

    inserted += currentBatchSize;
    console.log(`Seeded ${inserted}/${total} products`);
  }

  return { inserted, total, batchSize: size, startAt: start };
}

module.exports = { seedProducts };

if (require.main === module) {
  const targetCount = parseArgValue('--count', process.env.COUNT || '100000');
  const targetBatchSize = parseArgValue('--batch-size', process.env.BATCH_SIZE || '1000');
  const startAt = parseArgValue('--start-at', process.env.START_AT || '1');

  seedProducts({ count: targetCount, batchSize: targetBatchSize, startAt })
    .then((result) => {
      console.log(`Finished seeding ${result.inserted} products.`);
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
