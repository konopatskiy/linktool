const fs = require('fs');
const csv = require('csv-parser');
const { createModel, sequelize } = require('./database');
const { transliterate } = require('transliteration');
const { DataTypes } = require('sequelize'); // Import DataTypes

const importCsv = (filePath) => {
    /**
    * Processes a CSV file, reads its contents, and imports the data into a database.
    * 
    * @param {Function} resolve - The function to call if the operation is successful.
    * @param {Function} reject - The function to call if the operation fails.
    * @param {string} filePath - The path to the CSV file to be imported.
    * 
    * The function performs the following steps:
    * 1. Reads the CSV file using a semicolon (;) as the separator.
    * 2. Extracts the headers from the CSV file and transliterates them to create valid attribute names.
    * 3. Creates a Sequelize model based on the headers.
    * 4. Reads each row of the CSV file and maps the data to the corresponding attributes.
    * 5. Stores the processed data in an array.
    * 6. Synchronizes the Sequelize model with the database and bulk inserts the data.
    * 7. Resolves the promise if the operation is successful.
    * 8. Rejects the promise if there is an error during the process.
    * 
    * @returns {void}
    */
  return new Promise((resolve, reject) => {
    const products = [];
    let headers = null;
    let headerList = null; // Define headerList
    let ProductModel = null;

    fs.createReadStream(filePath)
      .pipe(csv({ separator: ';' })) // Use ; as the separator
      .on('headers', (headersFromCsv) => {
        headerList = headersFromCsv; // Assign headersFromCsv to headerList
        headers = headerList.map(header => transliterate(header).replace(/[^a-zA-Z0-9]/g, '_'));
        const attributes = headers.reduce((acc, header) => {
          acc[header] = DataTypes.STRING;
          return acc;
        }, {});
        ProductModel = createModel('Product', attributes);
      })
      .on('data', (row) => {
        const product = {};
        headers.forEach((header, index) => {
          const originalHeader = headerList[index];
          product[header] = row[originalHeader] || '?';
        });
        products.push(product);
      })
      .on('end', async () => {
        try {
          await sequelize.sync();
          await ProductModel.bulkCreate(products);
          resolve();
        } catch (error) {
          console.error('Error bulk creating products:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV file:', error);
        reject(error);
      });
  });
};

module.exports = importCsv;
