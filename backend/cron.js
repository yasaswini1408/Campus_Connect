const cron = require('node-cron');
const Assignment = require('./models/Assignment');
const Submission = require('./models/Submission');
const Notification = require('./models/Notification');
const User = require('./models/user');

// Run every day at 8 AM
cron.schedule('0 8 * * *', async () => {
  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24*60*60*1000);

    // Get assignments due in the next 24 hrs
    const assignments = await Assignment.find({
      dueDate: { $lte: tomorrow, $gte: now }
    });

    for (const assignment of assignments) {
      // Find all students who match year/branch/section
      const students = await User.find({
        role: 'student',
        'profile.year': assignment.year,
        'profile.branch': assignment.branch,
        'profile.section': assignment.section
      });

      for (const student of students) {
        // Check if student already submitted
        const submitted = await Submission.findOne({
          assignment: assignment._id,
          student: student._id
        });

        if (!submitted) {
          const notif = new Notification({
            user: student._id,
            title: `Assignment Due Soon`,
            message: `Your assignment "${assignment.title}" is due on ${assignment.dueDate.toDateString()}.`,
            link: '/student-assignments.html'
          });
          await notif.save();
        }
      }
    }

    console.log('Assignment reminders sent ✅');
  } catch (err) {
    console.error('Cron error:', err);
  }
});
