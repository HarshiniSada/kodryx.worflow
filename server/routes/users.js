const express = require('express');
const router = express.Router();
const { getUsers, createUser, getUserById, updateUser, deactivateUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, authorize('HR', 'Founding Team'), getUsers)
  .post(protect, authorize('HR'), createUser);

router.route('/:id')
  .get(protect, getUserById)
  .put(protect, authorize('HR', 'Founding Team'), updateUser);

router.patch('/:id/deactivate', protect, authorize('HR'), deactivateUser);

module.exports = router;
