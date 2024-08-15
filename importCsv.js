const fs = require('fs');
const csv = require('csv-parser');
const { createModel, sequelize } = require('./database');
const { transliterate } = require('transliteration');
const { DataTypes } = require('sequelize'); // Import DataTypes

const importCsv = (filePath) => {
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
