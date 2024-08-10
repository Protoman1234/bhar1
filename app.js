#!/usr/bin/env node
'use strict';

const path = require('path');
const app = require('express')();
const authenticate = require('./src/authenticate');
const params = require('./src/params');
const proxy = require('./src/proxy');

const PORT = process.env.PORT || 8080;

// Define paths to different favicons
const favicons = [
    path.join(__dirname, 'public', 'favicon1.ico'),
    path.join(__dirname, 'public', 'favicon2.ico'),
    path.join(__dirname, 'public', 'favicon3.ico'),
];

// Route to serve a random favicon from the list
app.get('/favicon.ico', (req, res) => {
    const randomFavicon = favicons[Math.floor(Math.random() * favicons.length)];
    res.sendFile(randomFavicon);
});

app.enable('trust proxy');

// Route with authentication, parameters processing, and proxy functionality
app.get('/', authenticate, params, proxy);

// Start the server
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
