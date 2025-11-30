const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false,
    timezone: "+00:00",
    define: {
      freezeTableName: true, // keep table names as-is
    },
  }
);

sequelize.authenticate()
  .then(() => console.log("Sequelize connected to DB successfully!"))
  .catch((err) => console.error("Sequelize connection failed:", err));

module.exports = { sequelize };
