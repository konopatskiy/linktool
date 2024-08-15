const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sequelize } = require('./database'); // Import sequelize
const importCsv = require('./importCsv');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

const upload = multer({ dest: 'uploads/' });

app.get('/api/products', async (req, res) => {
  try {
    const ProductModel = sequelize.models.Product;
    const products = await ProductModel.findAll();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Error fetching products');
  }
});

app.post('/api/import', upload.single('file'), async (req, res) => {
  const filePath = path.join(__dirname, req.file.path);
  try {
    await importCsv(filePath);
    fs.unlinkSync(filePath); // Remove the file after processing
    res.status(201).send('CSV imported successfully');
  } catch (error) {
    console.error('Error importing CSV:', error);
    res.status(500).send('Error importing CSV');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
