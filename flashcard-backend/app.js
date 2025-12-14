const express = require('express');
const app = express();
app.use(express.json());
var cors = require('cors');
app.use(cors());
const cardRoutes = require('./routes/flashcard_route');
app.use('/api/card', cardRoutes);
module.exports = app;

