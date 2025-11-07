const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Check if dist folder exists
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('ERROR: dist folder not found! Build may have failed.');
  console.error('Expected path:', distPath);
  process.exit(1);
}

console.log('Serving static files from:', distPath);

// Serve static files from the dist directory
app.use(express.static(distPath, { 
  dotfiles: 'ignore',
  index: 'index.html'
}));

// Handle client-side routing - send all requests to index.html
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application not found. Build files missing.');
  }
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
  console.log(`Serving from: ${distPath}`);
});

