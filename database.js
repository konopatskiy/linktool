const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite'
});

const createModel = (modelName, attributes) => {
  const modelAttributes = {};
  for (const [key, value] of Object.entries(attributes)) {
    modelAttributes[key] = {
      type: DataTypes.STRING,
      allowNull: true
    };
  }
  return sequelize.define(modelName, modelAttributes);
};

sequelize.sync();

module.exports = { sequelize, createModel };
