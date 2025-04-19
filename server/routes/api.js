const express = require('express');
const router = express.Router();

// Sample API route
router.get('/data', (req, res) => {
  // Example data
  const data = {
    items: [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' }
    ]
  };
  res.json(data);
});

module.exports = router; 