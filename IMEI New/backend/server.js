const express = require('express');
const path = require('path');
const app = express();

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Routes
app.use('/api/report', require('./routes/report'));
app.use('/api/admin', require('./routes/admin'));

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
require('./init'); // Run configuration when the server starts
