const express = require("express");
const bcrypt = require("bcryptjs");
const { pool } = require("./../db");
const router = express.Router();

//create user
router.post("/", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email) {
    return res
      .status(400)
      .json({ status: false, message: "Name and email are required." });
  }
  try {
    const password_hash = password ? await bcrypt.hash(password, 10) : null;
    const { rows } = await pool.query(
      `insert into users (name, email, password)
            values($1,$2,coalesce($3,null))
            returning id,name,email,created_at,updated_at
            `,
      [name.trim(), email.toLowerCase().trim(), password_hash]
    );
    return res
      .status(200)
      .json({ status: true, message: "User created", data: rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      return res
        .status(400)
        .json({ status: false, message: "Email already exist" });
    }
    return res.status(500).json({ status: false, message: error.message });
  }
});

//get users
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      select id,name,email,created_at,updated_at
      from users
      order by id desc
      `
    );
    return res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

//get user by id
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id))
    return res.json(400).json({ status: false, message: "Invalid id" });
  try {
    const { rows } = await pool.query(
      `
      select id,name,email,created_at,updated_at
      from users where id = $1 `,
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ status: false, message: "User not found" });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

//delete user
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id))
    return res.json(400).json({ status: false, message: "Invalid id" });
  try {
    const { rows } = await pool.query(
      `
      delete
      from users where id = $1 `,
      [id]
    );
    if (!rows) {
      return res.status(404).json({ status: false, message: "User not found" });
    }
    res.status(200).json({ status: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

//update user
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, email } = req.body;
  if (!Number.isInteger(id))
    return res.json(400).json({ status: false, message: "Invalid id" });
  try {
    const { rows } = await pool.query(
      `
      UPDATE users 
      SET name = $1, email = $2
      WHERE id = $3
      RETURNING id, name, email,created_at,updated_at
    `,
      [name, email, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      user: rows[0],
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

module.exports = router;
