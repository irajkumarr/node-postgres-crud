const express = require('express');
const dotenv = require('dotenv');
const { ensureSchema } = require('./schema');
const usersRouter = require('./routes/user');

dotenv.config();

const app = express();
app.use(express.json());


// Users CRUD
app.use('/users', usersRouter);

const port =process.env.PORT || 3000;

(async () => {
  try {
    await ensureSchema();
    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();