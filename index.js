require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

// INITIALIZE EXPRESS APP
const app = express();

// MIDDLEWARE
app.use(express.json());

app.use(
  cors({
    credentials: true,
    // origin: 'http://localhost:5173',
    origin: 'https://join-us-form.netlify.app',
  })
);

app.use('/', require('./routes/authRoute'));

// CONNECTING TO DATABASE.
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log('DATABASE: CONNECTED!'))
  .catch(() => console.log('NOT CONNECTED'));

// LISTENING
app.listen(process.env.PORT, () => {
  console.log('Now listening on port', process.env.PORT);
});
