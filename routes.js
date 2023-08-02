const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./user');
const Chat = require('./chat');

router.post('/register', async (req, res) => {
    // Validate the user's input
    // You might want to use a library like Joi for this

    // Check if a user with the same email already exists
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('User already registered.');

    // Hash the user's password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create a new user and save it to the database
    user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        // Add other fields as necessary
    });
    await user.save();

    const token = jwt.sign({ _id: user._id }, process.env.JWT_PRIVATE_KEY);
    res.header('x-auth-token', token).send(user);
});

router.post('/login', async (req, res) => {
    // Validate the user's input

    // Check if the user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Invalid email or password.');

    // Compare the provided password with the hashed password in the database
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send('Invalid email or password.');

    const token = jwt.sign({ _id: user._id }, process.env.JWT_PRIVATE_KEY);
    res.header('x-auth-token', token).send(token);
});

// More routes here

module.exports = router;
