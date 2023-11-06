const express = require('express');
const router = express.Router();
const path = require('path');

// the route start with / only or with /index with or without .html
router.get('^/$|/index(.html)?', (req, res) => {
    // where to find the file .. means go up a folder and inside views folder there is a file index.html
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'))
});

module.exports = router;