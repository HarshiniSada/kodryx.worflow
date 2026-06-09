const DailyStatusLog = require('../models/DailyStatusLog');

// Format current server time as e.g. "09:30 AM"
const currentTimeLabel = () => {
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minutes} ${ampm}`;
};

// @desc    Get daily status logs for a specific date
// @route   GET /api/daily-status
// @access  Private
const getDailyStatus = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    let query = { date };

    // If Employee or Intern, only show their own log unless they are HR or Founding Team
    if (req.user.role !== 'Founding Team' && req.user.role !== 'HR') {
      query.employee = req.user.id;
    }

    const logs = await DailyStatusLog.find(query).populate('employee', 'name avatar role designation department');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get the current user's status log for a date
// @route   GET /api/daily-status/my-status
// @access  Private
const getMyStatus = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const logs = await DailyStatusLog.find({ date, employee: req.user.id });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all status logs for a specific employee (newest first)
// @route   GET /api/daily-status/employee/:id
// @access  Private (HR, Founding Team, or the employee themselves)
const getEmployeeStatus = async (req, res) => {
  try {
    const targetId = req.params.id;
    if (req.user.role !== 'Founding Team' && req.user.role !== 'HR' && req.user.id !== targetId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const logs = await DailyStatusLog.find({ employee: targetId }).sort('-date');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add a task entry to the current user's status log (creates the
//          log for the day on first entry).
// @route   POST /api/daily-status
// @access  Private (Employee, Intern)
const createDailyStatus = async (req, res) => {
  try {
    const { date, taskUpdate } = req.body;

    if (!date || !taskUpdate || !taskUpdate.description) {
      return res.status(400).json({ message: 'Date and task description are required' });
    }

    let log = await DailyStatusLog.findOne({ date, employee: req.user.id });

    if (log && log.isLocked) {
      return res.status(400).json({ message: 'This log is locked for editing (past 6:00 PM)' });
    }

    const task = {
      description: taskUpdate.description,
      hoursSpent: taskUpdate.hoursSpent || 0,
      status: taskUpdate.status || 'In Progress',
      lastUpdated: currentTimeLabel(),
    };

    if (!log) {
      log = await DailyStatusLog.create({
        date,
        employee: req.user.id,
        tasks: [task],
      });
      return res.status(201).json(log);
    }

    log.tasks.push(task);
    await log.save();
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update daily status log
// @route   PUT /api/daily-status/:id
// @access  Private (Employee, Intern)
const updateDailyStatus = async (req, res) => {
  try {
    const log = await DailyStatusLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }

    if (log.employee.toString() !== req.user.id && req.user.role !== 'Founding Team') {
      return res.status(403).json({ message: 'Not authorized to update this log' });
    }

    if (log.isLocked && req.user.role !== 'Founding Team') {
      return res.status(400).json({ message: 'This log is locked for editing (past 6:00 PM)' });
    }

    const updatedLog = await DailyStatusLog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedLog);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDailyStatus,
  getMyStatus,
  getEmployeeStatus,
  createDailyStatus,
  updateDailyStatus
};
