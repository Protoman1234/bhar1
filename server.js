const express = require('express');
const authenticate = require('./src/authenticate');
const proxy = require('./src/proxy');

const app = express();
const PORT = process.env.PORT || 8080;

app.enable('trust proxy');
app.get('/', authenticate, proxy);
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
