const User = require('../model/user');


// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a new user
exports.addUser = async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const newUser = new User({ username, email, password, role });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  const { username, email, role } = req.body;
  try {
    await User.findByIdAndUpdate(req.params.id, { username, email, role });
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
