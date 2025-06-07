const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    try {
        const { name, username, password, role } = req.body;
    
        const userExists = await User.findOne({ username });
        if (userExists) return res.status(400).json({ message: 'Username already exists' });
    
        const user = await User.create({ name, username, password, role });
    
        res.status(201).json({
          user: {
            id: user._id,
            name: user.name,
            username: user.username,
            role: user.role
          }
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Registration failed - Internal Server Error' });
      }

}

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid username or password' });

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid username or password' });

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed - Internal Server Error' });
  }
};

module.exports = { registerUser, loginUser };