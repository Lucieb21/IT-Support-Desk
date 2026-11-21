
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false
});

// Create the database table automatically
async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS records (
      id SERIAL PRIMARY KEY,
      student_number VARCHAR(40) NOT NULL,
      student_name VARCHAR(120) NOT NULL,
      issue_title VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'Open',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

// API guide
app.get("/", (req, res) => {
  res.send(`
    <h1>IT Support Desk API</h1>
    <p>ICT251 Activity 7 Backend API</p>
    <h2>Available endpoints</h2>
    <ul>
      <li>GET /health</li>
      <li>GET /api/records</li>
      <li>GET /api/records/:id</li>
      <li>POST /api/records</li>
      <li>PUT /api/records/:id</li>
      <li>DELETE /api/records/:id</li>
    </ul>
  `);
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "IT Support Desk API is running" });
});

// Get all records
app.get("/api/records", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM records ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get one record
app.get("/api/records/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM records WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a record
app.post("/api/records", async (req, res) => {
  try {
    const {
      student_number,
      student_name,
      issue_title,
      description,
      status
    } = req.body;

    if (!student_number || !student_name || !issue_title || !description) {
      return res.status(400).json({
        error: "Please provide student number, student name, issue title and description"
      });
    }

    const result = await pool.query(
      `INSERT INTO records
       (student_number, student_name, issue_title, description, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        student_number,
        student_name,
        issue_title,
        description,
        status || "Open"
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a record
app.put("/api/records/:id", async (req, res) => {
  try {
    const {
      student_number,
      student_name,
      issue_title,
      description,
      status
    } = req.body;

    const result = await pool.query(
      `UPDATE records
       SET student_number = COALESCE($1, student_number),
           student_name = COALESCE($2, student_name),
           issue_title = COALESCE($3, issue_title),
           description = COALESCE($4, description),
           status = COALESCE($5, status),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [
        student_number,
        student_name,
        issue_title,
        description,
        status,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a record
app.delete("/api/records/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM records WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.json({ message: "Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server after database is ready
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Could not start server:", error);
    process.exit(1);
  }
}

startServer();
