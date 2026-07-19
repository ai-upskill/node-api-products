const { Client } = require('@opensearch-project/opensearch');
const dotenv = require('dotenv');

dotenv.config();

const node = process.env.OPENSEARCH_URL || process.env.OPENSEARCH_NODE || 'http://localhost:9200';
const authUser = process.env.OPENSEARCH_USERNAME;
const authPass = process.env.OPENSEARCH_PASSWORD;

const clientOptions = { node };
if (authUser && authPass) {
  clientOptions.auth = { username: authUser, password: authPass };
}

const client = new Client(clientOptions);

module.exports = { client };
