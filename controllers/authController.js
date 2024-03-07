const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const emailValidator = require('email-validator');
const User = require('../models/Users');
require('dotenv').config();

const test = (req, res) => {
  res.json('TEST IS WORKING');
};

// **************** REGISTER ****************

const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      birthday,
      sex,
      age,
      email,
      password,
      confirmPassword,
    } = req.body;

    // 1. Checking if all field is filled-out.
    if (
      !firstName ||
      !lastName ||
      !birthday ||
      !sex ||
      !age ||
      !email ||
      !password
    ) {
      res.status(400).json({ error: 'All field is required' });
      console.error('All field is required');
      return;
    }

    // 2. FIRST NAME
    if (!firstName || firstName.length < 2) {
      return res
        .status(400)
        .json({ error: 'First Name must be at least 2 letters' });
    }

    // 3. LAST NAME
    if (!lastName || lastName.length < 2) {
      return res
        .status(400)
        .json({ error: 'Last Name must be at least 2 letters' });
    }

    // 4. EMAIL
    if (!emailValidator.validate(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const exist = await User.findOne({ email });

    if (exist) {
      res.status(400).json({ error: 'Email is already in use' });
      console.error('Email already in use');
      return;
    }

    // 5. PASSWORD
    if (!password || password.length < 8) {
      return res
        .status(400)
        .json({ error: 'Password must be at least 8 characters' });
    }

    // 6. CONFIRM PASSWORD (IF MATCH)
    if (!confirmPassword || confirmPassword !== password) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // 7. PASSWORD HASHING
    const hashedPassword = await bcrypt.hash(password, 10);

    // 8. If all validations pass, proceed with user registration.
    const user = await User.create({
      firstName,
      lastName,
      birthday,
      sex,
      age,
      email,
      password: hashedPassword,
    });

    // 9. Return success response if registration is successful
    return res.status(200).json({ message: 'Registration successful', user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// **************** LOGIN ****************

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1st Validation - Checking if the field is blank/empty
    if (!email || !password) {
      res.status(401).json({ error: 'Please enter both email and password' });
      console.error('Please enter both email and password');
      return;
    }

    const user = await User.findOne({ email });

    // 2nd Validation - Checking if the email exist in the database
    if (!user) {
      console.error('No user found');
      res.status(401).json({ error: 'No user found' });
      return;
    }

    // 3rd Validation - Checking if the password will match
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      // Generate JWT token
      const accessToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
        expiresIn: '1d',
      });

      res.status(200).json({ token: accessToken, user });
    } else {
      // Passwords don't match
      console.error('Email or Password is incorrect ');
      res.status(401).json({ error: 'Email or Password is incorrect' });
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = { test, registerUser, loginUser };
