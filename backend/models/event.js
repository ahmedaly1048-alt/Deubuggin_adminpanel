const { DataTypes } = require("sequelize");
const { sequelize } = require("./index");

const Event = sequelize.define(
  "event",
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    user_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    kind: DataTypes.STRING,
    event_date: DataTypes.DATEONLY,
    status: DataTypes.TINYINT,
    status_message: DataTypes.STRING,
    join_start: DataTypes.DATEONLY,
    join_end: DataTypes.DATEONLY,
    exposure_pre_start: DataTypes.DATEONLY,
    exposure_pre_end: DataTypes.DATEONLY,
    exposure_main_start: DataTypes.DATEONLY,
    exposure_main_end: DataTypes.DATEONLY,
    createdat: DataTypes.DATE,
    updatedat: DataTypes.DATE,
    join_start_ts: DataTypes.BIGINT,
    join_end_ts: DataTypes.BIGINT,
    exposure_pre_start_ts: DataTypes.BIGINT,
    exposure_pre_end_ts: DataTypes.BIGINT,
    exposure_main_start_ts: DataTypes.BIGINT,
    exposure_main_end_ts: DataTypes.BIGINT,
    url_image_big: DataTypes.STRING,
    url_thumbnail: DataTypes.STRING,
  },
  { tableName: "event", timestamps: false }
);

module.exports = Event;
