OpenSearch integration

Run a local OpenSearch for testing:

```bash
docker compose -f docker-compose.opensearch.yml up -d
```

Install optional dependency if you plan to use OpenSearch client locally:

```bash
npm install @opensearch-project/opensearch
```

Index products from Supabase (small test):

```bash
# index first 5000
node src/indexer.js 1000 5000
```

Search endpoint will use OpenSearch when available. Set `OPENSEARCH_URL` env if not running on localhost.
