const { DataTypes } = require("sequelize");
const { sequelize } = require("./index");

const SnsKey = sequelize.define(
  "sns_key",
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    sns_id: DataTypes.INTEGER,
    api_key: DataTypes.STRING,
    api_secret: DataTypes.STRING,
    access_token: DataTypes.STRING,
    action: DataTypes.STRING,
    status: DataTypes.TINYINT,
    status_message: DataTypes.STRING,
    count_use_cumul: DataTypes.BIGINT,
    count_use_span: DataTypes.BIGINT,
    createdat: DataTypes.DATE,
    updatedat: DataTypes.DATE,
  },
  { tableName: "sns_key", timestamps: false }
);

module.exports = SnsKey;
