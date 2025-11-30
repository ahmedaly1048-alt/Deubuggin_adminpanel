const { DataTypes } = require("sequelize");
const { sequelize } = require("./index");

const User = sequelize.define(
  "user",
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    password: DataTypes.STRING,
    password_hash: DataTypes.STRING,
    pw: DataTypes.STRING,
    status: DataTypes.TINYINT,
    status_message: DataTypes.STRING,
    level: DataTypes.TINYINT,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { tableName: "user", timestamps: false }
);

module.exports = User;
