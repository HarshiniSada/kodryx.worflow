const cron = require('node-cron');
const DailyStatusLog = require('../models/DailyStatusLog');

const setupCronJobs = () => {
  // Run every day at 18:00 (6:00 PM)
  cron.schedule('0 18 * * *', async () => {
    console.log('Running daily status lock cron job...');
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // Find all unlocked logs for today and lock them
      const result = await DailyStatusLog.updateMany(
        { date: todayStr, isLocked: false },
        { $set: { isLocked: true } }
      );

      console.log(`Locked ${result.modifiedCount} daily status logs for ${todayStr}`);
    } catch (error) {
      console.error('Error running daily status lock cron job:', error);
    }
  });
  
  console.log('Cron jobs initialized');
};

module.exports = setupCronJobs;
