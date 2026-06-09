const mongoose = require('mongoose');

const DailyStatusLogSchema = new mongoose.Schema({
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
  },
  employee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  tasks: [{
    task: { type: String, required: true },        // task title / description
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed'],
      default: 'Not Started',
    },
    progress: { type: Number, default: 0 },        // 0-100
    updated: { type: String, default: '—' },       // e.g. "09:30 AM"
    notes: { type: String, default: '' },          // comments
  }],
  isLocked: {
    type: Boolean,
    default: false, // Locked at 6PM daily
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('DailyStatusLog', DailyStatusLogSchema);
