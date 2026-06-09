const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Founding Team, HR)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create new user (invite)
// @route   POST /api/users
// @access  Private (HR)
const createUser = async (req, res) => {
  try {
    const { name, email, role, department, designation, joiningDate, reportingManager, type } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Avatar generation simple logic
    const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);
    const colors = [{bg:'#DBEAFE',c:'#1E40AF'},{bg:'#D1FAE5',c:'#065F46'},{bg:'#EDE9FE',c:'#5B21B6'},{bg:'#FEF3C7',c:'#92400E'}];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const user = await User.create({
      name,
      email,
      password: 'password123', // Default password for new users
      role: type === 'hr' ? 'HR' : type === 'intern' ? 'Intern' : 'Employee', // mapping type to enum
      department,
      designation: designation || role,
      joiningDate,
      reportingManager,
      avatar: { initials, bg: color.bg, color: color.c }
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (HR, Founding Team)
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Deactivate user
// @route   PATCH /api/users/:id/deactivate
// @access  Private (HR)
const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = 'inactive';
    await user.save();
    res.json({ message: 'User deactivated', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deactivateUser
};
