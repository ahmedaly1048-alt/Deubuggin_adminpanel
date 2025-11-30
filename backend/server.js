require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { Sequelize, Op } = require("sequelize");

const { sequelize } = require("./models/index");
const User = require("./models/user");
const Event = require("./models/event");
const Item = require("./models/item");
const SnsKey = require("./models/sns_key");

const { normalizeDate, normalizeInt } = require("./utils/helper");
const { requireAuth, blacklistToken, tokenBlacklist } = require("./middleware/auth");

const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "https://mintio.shop",
    "https://www.mintio.shop"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));


app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = "8h";

// ------------------------
// ADMIN LOGIN
// ------------------------
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username and password are required" });

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ message: "Invalid username or password" });

    if (Number(user.level) !== 90)
      return res.status(403).json({ message: "Forbidden: superadmin only" });

    if (password !== user.pw)
      return res.status(401).json({ message: "Invalid username or password" });

    const token = jwt.sign(
      { id: user.id, username: user.username, level: user.level },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    return res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, level: user.level },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Login failed", details: err.message });
  }
});

// ------------------------
// VERIFY TOKEN
// ------------------------
app.post("/api/verify-token", (req, res) => {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer "))
    return res.json({ valid: false, message: "Missing token" });

  const token = authHeader.split(" ")[1];
  if (tokenBlacklist.has(token)) return res.json({ valid: false, message: "Token revoked" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ valid: true, decoded });
  } catch (err) {
    return res.json({ valid: false, message: err.message });
  }
});

// ------------------------
// LOGOUT
// ------------------------
app.post("/api/admin/logout", (req, res) => {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return res.json({ ok: true });

  const token = authHeader.split(" ")[1];
  blacklistToken(token);
  return res.json({ ok: true });
});

// ------------------------
// EVENTS
// ------------------------
app.get("/events", requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.search || "";
    let sortBy = req.query.sortBy || "id";
    const sortOrder = req.query.sortOrder === "desc" ? "DESC" : "ASC";

    const allowedSort = { id: "id", date: "event_date", title: "title", status: "status_message" };
    const sortColumn = allowedSort[sortBy] || "id";

    const total = await Event.count({ where: { title: { [Op.like]: `%${search}%` } } });

    const events = await Event.findAll({
      where: { title: { [Op.like]: `%${search}%` } },
      order: [[sortColumn, sortOrder], ["id", "ASC"]],
      limit,
      offset,
    });

    res.json({ events, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Query failed", details: err });
  }
});

app.get("/events/:id", requireAuth, async (req, res) => {
  try {
    console.log("Fetching event ID:", req.params.id, "User:", req.user);
    const event = await Event.findByPk(req.params.id);
    console.log("Event found:", event);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    console.error("Error in /events/:id:", err);
    res.status(500).json({ error: "Query failed", details: err.message });
  }
});



app.post("/events", requireAuth, async (req, res) => {
  try {
    const event = await Event.create({
      title: req.body.title || null,
      description: req.body.description || null,
      kind: req.body.kind || null,
      event_date: normalizeDate(req.body.event_date),
      status: normalizeInt(req.body.status, 1),
      status_message: req.body.status_message || "",
      join_start: normalizeDate(req.body.join_start),
      join_end: normalizeDate(req.body.join_end),
      exposure_pre_start: normalizeDate(req.body.exposure_pre_start),
      exposure_pre_end: normalizeDate(req.body.exposure_pre_end),
      exposure_main_start: normalizeDate(req.body.exposure_main_start),
      exposure_main_end: normalizeDate(req.body.exposure_main_end),
      createdat: new Date(),
      updatedat: new Date(),
    });

    res.json({ message: "Event created successfully!", id: event.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create event", details: err });
  }
});

app.put("/events/:id", requireAuth, async (req, res) => {
  try {
    const [updated] = await Event.update({
      title: req.body.title || null,
      description: req.body.description || null,
      kind: req.body.kind || null,
      event_date: normalizeDate(req.body.event_date),
      status: normalizeInt(req.body.status, 1),
      status_message: req.body.status_message || "",
      join_start: normalizeDate(req.body.join_start),
      join_end: normalizeDate(req.body.join_end),
      exposure_pre_start: normalizeDate(req.body.exposure_pre_start),
      exposure_pre_end: normalizeDate(req.body.exposure_pre_end),
      exposure_main_start: normalizeDate(req.body.exposure_main_start),
      exposure_main_end: normalizeDate(req.body.exposure_main_end),
      updatedat: new Date(),
    }, { where: { id: req.params.id } });

    if (!updated) return res.status(404).json({ error: "Event not found or no changes made" });
    res.json({ message: "Event updated successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Update failed", details: err });
  }
});

// ------------------------
// ITEMS
// ------------------------
app.get("/items", requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.search || "";
    const userId = req.query.user_id;
    let sortBy = req.query.sortBy || "id";
    const sortOrder = req.query.sortOrder === "desc" ? "DESC" : "ASC";

    const allowedSort = ["id", "name", "status"];
    if (!allowedSort.includes(sortBy)) sortBy = "id";

    const where = { name: { [Op.like]: `%${search}%` } };
    if (userId) where.user_id = userId;

    const total = await Item.count({ where });
    const items = await Item.findAll({
      where,
      order: [[sortBy, sortOrder], ["id", "ASC"]],
      limit,
      offset,
    });

    const start = total === 0 ? 0 : offset + 1;
    const end = Math.min(offset + limit, total);
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    res.json({ items, total, start, end, currentPage, totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Query failed", details: err });
  }
});

app.get("/items/:id", requireAuth, async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Query failed", details: err });
  }
});

app.put("/items/:id/status", requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (status === undefined) return res.status(400).json({ error: "Missing status value" });

    let statusMessage = status == 1 ? "Approved" : status == 2 ? "Banned / Archived / Hidden" : status == 0 ? "Deactivated / Hidden" : "Unknown";

    const [updated] = await Item.update(
      { status, status_message: statusMessage, updatedat: new Date() },
      { where: { id: req.params.id } }
    );

    if (!updated) return res.status(404).json({ error: "Item not found" });
    res.json({ success: true, message: "Item status updated successfully", itemId: req.params.id, newStatus: status, newStatusMessage: statusMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed", details: err });
  }
});

// ------------------------
// USERS
// ------------------------
app.get("/users", requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.search || "";
    let sortBy = req.query.sortBy || "id";
    const sortOrder = req.query.sortOrder === "desc" ? "DESC" : "ASC";

    const validSortFields = ["id", "username", "status"];
    if (!validSortFields.includes(sortBy)) sortBy = "id";

    const total = await User.count({ where: { username: { [Op.like]: `%${search}%` } } });
    const users = await User.findAll({
      where: { username: { [Op.like]: `%${search}%` } },
      order: [[sortBy, sortOrder], ["id", "ASC"]],
      limit,
      offset,
    });

    const start = total === 0 ? 0 : offset + 1;
    const end = Math.min(offset + limit, total);
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    res.json({ users, total, start, end, currentPage, totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Query failed", details: err });
  }
});

app.get("/users/:id", requireAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Query failed", details: err });
  }
});

app.put("/users/:id/status", requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (status === undefined) return res.status(400).json({ error: "Missing status value" });

    let statusMessage = status == 1 ? "Active" : status == 2 ? "Suspended / Banned" : status == 0 ? "Deactivated" : "Unknown";

    const [updated] = await User.update(
      { status, status_message: statusMessage, updatedAt: new Date() },
      { where: { id: req.params.id } }
    );

    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, message: "User status updated successfully", userId: req.params.id, newStatus: status, newStatusMessage: statusMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed", details: err });
  }
});

// ------------------------
// SNS KEYS
// ------------------------
app.get("/admin/list/custom/sns_key/:search/:sortBy/:sortOrder/:offset/:limit", requireAuth, async (req, res) => {
  try {
    let { search, sortBy, sortOrder, offset, limit } = req.params;
    offset = parseInt(offset) || 0;
    limit = parseInt(limit) || 50;

    const searchTerm = search === "_" ? "" : `%${search}%`;
    const orderField = ["id", "sns_id", "status", "createdat"].includes(sortBy) ? sortBy : "id";
    const orderDir = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const where = searchTerm
      ? { [Op.or]: [{ sns_id: { [Op.like]: searchTerm } }, { api_key: { [Op.like]: searchTerm } }] }
      : {};

    const total = await SnsKey.count({ where });
    const list = await SnsKey.findAll({ where, order: [[orderField, orderDir]], limit, offset });

    const start = total === 0 ? 0 : offset + 1;
    const end = Math.min(offset + limit, total);
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    res.json({ list, total, start, end, currentPage, totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Query failed", details: err });
  }
});

// ------------------------
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected!");
    console.log(`Server running on port ${PORT}`);
  } catch (err) {
    console.error("Database connection failed:", err);
  }
});
