const { DataTypes } = require("sequelize");
const { sequelize } = require("./index");

const Item = sequelize.define(
  "item",
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    user_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    url_storage: DataTypes.STRING,
    description: DataTypes.TEXT,
    status: DataTypes.TINYINT,
    event_id: DataTypes.INTEGER,
    status_message: DataTypes.STRING,
    createdat: DataTypes.DATE,
    updatedat: DataTypes.DATE,
    url_thumbnail: DataTypes.STRING,
  },
  { tableName: "item", timestamps: false }
);

module.exports = Item;
