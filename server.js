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

/**
* Asynchronous function to fetch all products from the database and send them as a JSON response.
* 
* @async
* @param {Object} req - The request object from the client.
* @param {Object} res - The response object to send data back to the client.
* @returns {Promise<void>} - A promise that resolves when the operation is complete.
* @throws {Error} - If there is an error fetching products from the database, it logs the error and sends a 500 status response.
*/
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

/**
* Asynchronously handles the import of a CSV file and sends an appropriate response.
* 
* @param {Object} req - The HTTP request object, containing the file to be imported.
* @param {Object} res - The HTTP response object used to send the response.
* @returns {Promise<void>} - A promise that resolves when the CSV import process is complete.
* 
* @throws {Error} - If there is an error during the CSV import process, a 500 status code is sent with an error message.
*/
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

/**
* Logs a message indicating that the server is running and provides the URL.
* @param {number} port - The port number on which the server is running.
* @returns {void}
*/
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
