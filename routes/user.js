const express = require("express");
const bcrypt = require("bcryptjs");
const { pool } = require("./../db");
const router = express.Router();

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
    return res.status(200).json({status:true,message:"User created",data:rows[0]});
  } catch (error) {
    if (error.code === "23505") {
      return res
        .status(400)
        .json({ status: false, message: "Email already exist" });
    }
    return res.status(500).json({ status: false, message: error.message });
  }
});

module.exports = router;
