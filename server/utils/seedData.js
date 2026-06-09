const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const DailyStatusLog = require('../models/DailyStatusLog');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const Payroll = require('../models/Payroll');
const Payslip = require('../models/Payslip');
const Notification = require('../models/Notification');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { connectDB } = require('../config/db');

// =====================================================================
//  USERS — mirrors the prototype (Riya Kapoor founder, Sarah Adams HR,
//  the 6 MEMBERS and 2 interns). All passwords: password123
// =====================================================================
const usersData = [
  {
    key: 'riya', name: 'Riya Kapoor', email: 'riya@company.com', password: 'password123',
    role: 'Founding Team', designation: 'Co-Founder · CEO', department: 'Management',
    joiningDate: '2021-01-01', status: 'active',
    avatar: { initials: 'RK', bg: '#EEF2FF', color: '#4F46E5' },
    leaveBalance: { total: 24, taken: 0, available: 24 },
  },
  {
    key: 'sarah', name: 'Sarah Adams', email: 'hr@company.com', password: 'password123',
    role: 'HR', designation: 'HR Manager', department: 'Human Resources',
    joiningDate: '2021-06-01', status: 'active',
    avatar: { initials: 'SA', bg: '#FCE7F3', color: '#9D174D' },
    leaveBalance: { total: 24, taken: 0, available: 24 },
  },
  {
    key: 'pn', name: 'Priya Nair', email: 'priya.nair@company.com', password: 'password123',
    role: 'Employee', designation: 'Senior Analyst', department: 'Operations',
    joiningDate: '2022-01-15', status: 'active',
    avatar: { initials: 'PN', bg: '#FEE2E2', color: '#991B1B' },
    leaveBalance: { total: 24, taken: 8, available: 16 },
    workStats: { activeTasks: 8, completed: 14, performance: 72, workload: 85 },
    workStatus: 'Overdue task', upcomingLeave: 'None scheduled',
  },
  {
    key: 'lf', name: 'Lena Fischer', email: 'lena.fischer@company.com', password: 'password123',
    role: 'Employee', designation: 'Data Engineer', department: 'AI Research',
    joiningDate: '2023-03-08', status: 'active',
    avatar: { initials: 'LF', bg: '#DBEAFE', color: '#1E40AF' },
    leaveBalance: { total: 24, taken: 5, available: 19 },
    workStats: { activeTasks: 5, completed: 11, performance: 68, workload: 70 },
    workStatus: 'Blocked', upcomingLeave: 'None scheduled',
  },
  {
    key: 'so', name: 'Sam Osei', email: 'sam.osei@company.com', password: 'password123',
    role: 'Employee', designation: 'Operations Lead', department: 'Operations',
    joiningDate: '2021-06-03', status: 'active',
    avatar: { initials: 'SO', bg: '#D1FAE5', color: '#065F46' },
    leaveBalance: { total: 24, taken: 3, available: 21 },
    workStats: { activeTasks: 6, completed: 22, performance: 94, workload: 60 },
    workStatus: 'On track', upcomingLeave: 'None scheduled',
  },
  {
    key: 'at', name: 'Aiko Tanaka', email: 'aiko.tanaka@company.com', password: 'password123',
    role: 'Employee', designation: 'Frontend Engineer', department: 'Product Dev',
    joiningDate: '2022-09-12', status: 'active',
    avatar: { initials: 'AT', bg: '#EDE9FE', color: '#5B21B6' },
    leaveBalance: { total: 24, taken: 6, available: 18 },
    workStats: { activeTasks: 7, completed: 28, performance: 98, workload: 75 },
    workStatus: 'On track', upcomingLeave: 'None scheduled',
  },
  {
    key: 'mw', name: 'Marcus Webb', email: 'marcus.webb@company.com', password: 'password123',
    role: 'Employee', designation: 'ML Engineer', department: 'AI Research',
    joiningDate: '2023-02-20', status: 'on-leave',
    avatar: { initials: 'MW', bg: '#FCE7F3', color: '#9D174D' },
    leaveBalance: { total: 24, taken: 10, available: 14 },
    workStats: { activeTasks: 4, completed: 17, performance: 81, workload: 55 },
    workStatus: 'In review', upcomingLeave: 'Jun 9–12 (Approved)',
  },
  {
    key: 'dr', name: 'Divya Rao', email: 'divya.rao@company.com', password: 'password123',
    role: 'Employee', designation: 'Product Manager', department: 'Product Dev',
    joiningDate: '2022-04-01', status: 'active',
    avatar: { initials: 'DR', bg: '#FEF3C7', color: '#92400E' },
    leaveBalance: { total: 24, taken: 4, available: 20 },
    workStats: { activeTasks: 9, completed: 31, performance: 91, workload: 80 },
    workStatus: 'On track', upcomingLeave: 'Jul 3 (Approved)',
  },
  {
    key: 'alex', name: 'Alex Chen', email: 'alex.chen@company.com', password: 'password123',
    role: 'Intern', designation: 'Engineering Intern', department: 'Product Dev',
    joiningDate: '2026-01-10', status: 'active',
    avatar: { initials: 'AC', bg: '#F0FDF4', color: '#166534' },
    leaveBalance: { total: 12, taken: 2, available: 10 },
  },
  {
    key: 'rs', name: 'Riya Sharma', email: 'riya.sharma@company.com', password: 'password123',
    role: 'Intern', designation: 'Research Intern', department: 'AI Research',
    joiningDate: '2026-01-10', status: 'active',
    avatar: { initials: 'RS', bg: '#FFF7ED', color: '#9A3412' },
    leaveBalance: { total: 12, taken: 1, available: 11 },
  },
];

const seedData = async (skipConnect = false) => {
  try {
    if (!skipConnect) await connectDB();

    await Promise.all([
      User.deleteMany(), Project.deleteMany(), Task.deleteMany(),
      DailyStatusLog.deleteMany(), Attendance.deleteMany(), LeaveRequest.deleteMany(),
      Payroll.deleteMany(), Payslip.deleteMany(), Notification.deleteMany(),
    ]);
    console.log('Data Cleared!');

    // ---- Users ----
    const reportsTo = (id) => ({ reportingManager: id });
    const created = {};
    // create one-by-one so pre-save password hashing runs per doc
    for (const u of usersData) {
      const { key, ...fields } = u;
      const doc = await User.create(fields);
      created[key] = doc;
    }
    // set reporting manager (everyone reports to Riya) — use updateOne to skip re-hash
    const riyaId = created.riya._id;
    for (const key of Object.keys(created)) {
      if (key === 'riya') continue;
      await User.updateOne({ _id: created[key]._id }, reportsTo(riyaId));
    }
    const id = (k) => created[k]._id;

    // ---- Projects ----
    const projectsData = [
      { name: 'Workday Project', description: 'HR & scheduling platform integration', status: 'On track', progress: 68, dueDate: 'Jun 30', updated: 'Jun 7', icon: 'fa-calendar-days', iconBg: '#EEF2FF', iconColor: '#4F46E5', barColor: 'var(--brand)', members: ['pn', 'so', 'mw', 'dr'] },
      { name: 'AI Research', description: 'LLM fine-tuning pipeline & eval framework', status: 'At risk', progress: 45, dueDate: 'Jul 15', updated: 'Jun 6', icon: 'fa-brain', iconBg: '#DBEAFE', iconColor: '#1D4ED8', barColor: 'var(--warning)', members: ['lf', 'mw', 'at'] },
      { name: 'Product Development', description: 'Core platform v2 — new dashboard & APIs', status: 'On track', progress: 82, dueDate: 'Jun 20', updated: 'Jun 8', icon: 'fa-laptop-code', iconBg: '#D1FAE5', iconColor: '#065F46', barColor: 'var(--success)', members: ['at', 'dr', 'mw', 'so', 'pn'] },
      { name: 'Client Success', description: 'Enterprise onboarding & retention ops', status: 'Ahead', progress: 91, dueDate: 'Jun 10', updated: 'Jun 8', icon: 'fa-star', iconBg: '#FEF3C7', iconColor: '#92400E', barColor: 'var(--success)', members: ['dr', 'so', 'at'] },
      { name: 'Internal Operations', description: 'Infrastructure, compliance & logistics', status: 'In progress', progress: 57, dueDate: 'Jul 1', updated: 'Jun 7', icon: 'fa-gears', iconBg: '#F3F4F6', iconColor: '#374151', barColor: 'var(--info)', members: ['so', 'lf', 'pn'] },
    ];
    const projects = {};
    for (const p of projectsData) {
      const doc = await Project.create({
        ...p,
        members: p.members.map(id),
        createdBy: riyaId,
        updatedAt: undefined,
      });
      projects[p.name] = doc;
    }
    const proj = (name) => projects[name]._id;

    // ---- Tasks (ALL_TASKS) ----
    const tasksData = [
      { title: 'Reconcile March carrier invoices', taskId: 'WF-218', assignee: 'pn', priority: 'Urgent', status: 'Overdue', dueDate: 'Jun 6', project: 'Workday Project' },
      { title: 'Q1 fuel-cost variance report', taskId: 'WF-240', assignee: 'lf', priority: 'High', status: 'Blocked', dueDate: 'Jun 3', project: 'AI Research' },
      { title: 'API rate limiter implementation', taskId: 'WF-311', assignee: 'at', priority: 'High', status: 'In Progress', dueDate: 'Jun 10', project: 'Product Development' },
      { title: 'Auth flow unit tests', taskId: 'WF-312', assignee: 'at', priority: 'Medium', status: 'In Progress', dueDate: 'Jun 10', project: 'Product Development' },
      { title: 'Update warehouse safety checklist', taskId: 'WF-205', assignee: 'so', priority: 'Medium', status: 'Submitted', dueDate: 'Jun 5', project: 'Internal Operations' },
      { title: 'LLM fine-tuning v2 checkpoint', taskId: 'WF-289', assignee: 'mw', priority: 'High', status: 'In review', dueDate: 'Jun 12', project: 'AI Research' },
      { title: 'Vendor SLA review', taskId: 'WF-198', assignee: 'so', priority: 'Low', status: 'Completed', dueDate: 'Jun 4', project: 'Client Success' },
      { title: 'Dashboard v2 QA review', taskId: 'WF-301', assignee: 'dr', priority: 'Medium', status: 'Completed', dueDate: 'Jun 7', project: 'Product Development' },
    ];
    await Task.insertMany(tasksData.map((t) => ({
      ...t, assignee: id(t.assignee), project: proj(t.project), createdBy: riyaId,
    })));

    // ---- Daily Status Logs (DAILY_LOG) ----
    const DAILY_LOG = {
      '2026-06-08': {
        pn: [{ task: 'Reconcile March carrier invoices', status: 'Not Started', progress: 0, updated: '—', notes: 'Awaiting finance sign-off' }, { task: 'Q2 vendor payment audit', status: 'In Progress', progress: 40, updated: '09:30 AM', notes: 'Reviewing vendor contracts' }],
        lf: [{ task: 'Q1 fuel-cost variance report', status: 'In Progress', progress: 25, updated: '10:15 AM', notes: 'Blocked on finance data input' }, { task: 'Data pipeline ETL refactor', status: 'Not Started', progress: 0, updated: '—', notes: 'Scheduled for afternoon' }],
        so: [{ task: 'Warehouse safety checklist', status: 'Completed', progress: 100, updated: '11:00 AM', notes: 'All items verified and signed off' }, { task: 'Ops runbook update', status: 'In Progress', progress: 60, updated: '02:00 PM', notes: 'Half sections done' }],
        at: [{ task: 'API rate limiter implementation', status: 'In Progress', progress: 60, updated: '11:30 AM', notes: 'Core logic done, testing next' }, { task: 'Auth flow unit tests', status: 'In Progress', progress: 30, updated: '09:00 AM', notes: 'Writing test cases' }],
        mw: [{ task: 'LLM fine-tuning v2 checkpoint', status: 'In Progress', progress: 75, updated: '01:00 PM', notes: 'Training run at 75%, ETA 3h' }, { task: 'Model evaluation harness', status: 'Not Started', progress: 0, updated: '—', notes: 'Pending checkpoint completion' }],
        dr: [{ task: 'Dashboard v2 QA review', status: 'Completed', progress: 100, updated: '10:00 AM', notes: 'Zero critical bugs found' }, { task: 'Q3 roadmap planning', status: 'In Progress', progress: 50, updated: '03:00 PM', notes: 'Slides 1-8 complete' }],
      },
      '2026-06-07': {
        pn: [{ task: 'Invoice reconciliation prep', status: 'Completed', progress: 100, updated: '05:30 PM', notes: 'Prepared all Q1 invoices for review' }, { task: 'Budget forecast spreadsheet', status: 'In Progress', progress: 65, updated: '04:00 PM', notes: 'June projections complete' }],
        lf: [{ task: 'Data warehouse audit', status: 'Completed', progress: 100, updated: '06:00 PM', notes: 'Audit complete, report filed' }, { task: 'ETL pipeline planning', status: 'In Progress', progress: 40, updated: '03:30 PM', notes: 'Architecture doc 40% done' }],
        so: [{ task: 'Vendor SLA review', status: 'Completed', progress: 100, updated: '02:00 PM', notes: 'Closed early — all SLAs met' }, { task: 'Safety checklist prep', status: 'Completed', progress: 100, updated: '05:00 PM', notes: 'Checklist template finalised' }],
        at: [{ task: 'Dashboard v2 QA', status: 'Completed', progress: 100, updated: '04:30 PM', notes: 'QA passed, merged to main' }, { task: 'Auth module delivery', status: 'Completed', progress: 100, updated: '11:00 AM', notes: 'Delivered 2 days ahead of schedule' }],
        mw: [{ task: 'LLM training data prep', status: 'Completed', progress: 100, updated: '05:00 PM', notes: '10k samples cleaned and uploaded' }, { task: 'Fine-tuning v2 start', status: 'In Progress', progress: 20, updated: '06:00 PM', notes: 'Run initiated, monitoring overnight' }],
        dr: [{ task: 'Q2 roadmap review', status: 'Completed', progress: 100, updated: '03:00 PM', notes: 'Approved by Riya' }, { task: 'Client onboarding deck', status: 'In Progress', progress: 70, updated: '05:30 PM', notes: 'Needs final slide polish' }],
      },
      '2026-06-06': {
        pn: [{ task: 'March invoice collection', status: 'Completed', progress: 100, updated: '04:00 PM', notes: 'All 47 invoices collected' }, { task: 'Vendor contact follow-ups', status: 'Completed', progress: 100, updated: '05:30 PM', notes: 'Emails sent to 8 vendors' }],
        lf: [{ task: 'Fuel cost data pull', status: 'In Progress', progress: 50, updated: '05:00 PM', notes: 'Waiting on 3 regional inputs' }, { task: 'Dashboard telemetry fix', status: 'Completed', progress: 100, updated: '02:00 PM', notes: 'Bug resolved, metrics live' }],
        so: [{ task: 'Fleet maintenance check', status: 'Completed', progress: 100, updated: '01:00 PM', notes: 'All 12 vehicles logged' }, { task: 'Compliance doc update', status: 'In Progress', progress: 80, updated: '05:00 PM', notes: 'Final section pending legal review' }],
        at: [{ task: 'Login page redesign', status: 'Completed', progress: 100, updated: '03:00 PM', notes: 'Figma to code, pixel perfect' }, { task: 'Mobile responsive CSS', status: 'In Progress', progress: 45, updated: '05:30 PM', notes: 'Tablet breakpoints done' }],
        mw: [{ task: 'Dataset labeling review', status: 'Completed', progress: 100, updated: '04:30 PM', notes: '2k labels reviewed and corrected' }, { task: 'Model baseline run', status: 'Completed', progress: 100, updated: '06:00 PM', notes: 'Baseline BLEU: 0.42' }],
        dr: [{ task: 'Sprint planning facilitation', status: 'Completed', progress: 100, updated: '11:30 AM', notes: '22 stories pointed and assigned' }, { task: 'Feature spec: notifications', status: 'In Progress', progress: 55, updated: '05:00 PM', notes: 'User stories drafted' }],
      },
    };
    const dailyDocs = [];
    for (const date of Object.keys(DAILY_LOG)) {
      for (const memberKey of Object.keys(DAILY_LOG[date])) {
        dailyDocs.push({
          date,
          employee: id(memberKey),
          tasks: DAILY_LOG[date][memberKey],
          isLocked: date !== '2026-06-08', // past days locked
        });
      }
    }
    await DailyStatusLog.insertMany(dailyDocs);

    // ---- Attendance (2026-06-08 / 07 / 06, from prototype ATT_DATA) ----
    const ATT = {
      '2026-06-08': [
        { k: 'pn', login: '09:02 AM', logout: '06:15 PM', hours: '9h 13m', status: 'present', late: false },
        { k: 'lf', login: '10:42 AM', logout: '—', hours: 'In office', status: 'present', late: true },
        { k: 'so', login: '08:55 AM', logout: '05:58 PM', hours: '9h 03m', status: 'present', late: false },
        { k: 'at', login: '09:10 AM', logout: '06:30 PM', hours: '9h 20m', status: 'present', late: false },
        { k: 'mw', login: '—', logout: '—', hours: 'On leave', status: 'on_leave', late: false },
        { k: 'dr', login: '08:48 AM', logout: '05:45 PM', hours: '8h 57m', status: 'present', late: false },
        { k: 'alex', login: '09:30 AM', logout: '05:30 PM', hours: '8h 00m', status: 'present', late: false },
        { k: 'rs', login: '09:15 AM', logout: '05:20 PM', hours: '8h 05m', status: 'present', late: false },
      ],
      '2026-06-07': [
        { k: 'pn', login: '09:05 AM', logout: '06:00 PM', hours: '8h 55m', status: 'present', late: false },
        { k: 'lf', login: '11:15 AM', logout: '07:00 PM', hours: '7h 45m', status: 'present', late: true },
        { k: 'so', login: '—', logout: '—', hours: 'Absent', status: 'absent', late: false },
        { k: 'at', login: '08:50 AM', logout: '06:00 PM', hours: '9h 10m', status: 'present', late: false },
        { k: 'mw', login: '09:00 AM', logout: '05:30 PM', hours: '8h 30m', status: 'present', late: false },
        { k: 'dr', login: '10:30 AM', logout: '06:30 PM', hours: '8h 00m', status: 'present', late: true },
        { k: 'alex', login: '09:20 AM', logout: '05:20 PM', hours: '8h 00m', status: 'present', late: false },
        { k: 'rs', login: '—', logout: '—', hours: 'Absent', status: 'absent', late: false },
      ],
      '2026-06-06': [
        { k: 'pn', login: '09:00 AM', logout: '05:45 PM', hours: '8h 45m', status: 'present', late: false },
        { k: 'lf', login: '09:30 AM', logout: '06:00 PM', hours: '8h 30m', status: 'present', late: false },
        { k: 'so', login: '08:45 AM', logout: '05:50 PM', hours: '9h 05m', status: 'present', late: false },
        { k: 'at', login: '11:00 AM', logout: '07:00 PM', hours: '8h 00m', status: 'present', late: true },
        { k: 'mw', login: '09:10 AM', logout: '06:10 PM', hours: '9h 00m', status: 'present', late: false },
        { k: 'dr', login: '—', logout: '—', hours: 'Absent', status: 'absent', late: false },
        { k: 'alex', login: '09:25 AM', logout: '05:25 PM', hours: '8h 00m', status: 'present', late: false },
        { k: 'rs', login: '09:00 AM', logout: '05:30 PM', hours: '8h 30m', status: 'present', late: false },
      ],
    };
    const attDocs = [];
    for (const date of Object.keys(ATT)) {
      ATT[date].forEach((a) => attDocs.push({
        employee: id(a.k), date, loginTime: a.login, logoutTime: a.logout,
        hoursWorked: a.hours, isLate: a.late, status: a.status,
      }));
    }
    await Attendance.insertMany(attDocs);

    // ---- Leave Requests ----
    const leaveDocs = [
      { employee: id('pn'), type: 'Sick leave', startDate: '2026-06-12', endDate: '2026-06-13', days: 2, reason: 'Medical appointment', status: 'Pending' },
      { employee: id('lf'), type: 'Personal', startDate: '2026-06-15', endDate: '2026-06-15', days: 1, reason: 'Personal errand', status: 'Pending' },
      { employee: id('mw'), type: 'Annual leave', startDate: '2026-06-09', endDate: '2026-06-12', days: 4, reason: 'Family vacation', status: 'Approved', reviewedBy: id('sarah') },
      { employee: id('dr'), type: 'Personal', startDate: '2026-07-03', endDate: '2026-07-03', days: 1, reason: 'Personal day', status: 'Approved', reviewedBy: id('sarah') },
    ];
    await LeaveRequest.insertMany(leaveDocs);

    // ---- Payroll (June 2026, HR_PAYROLL) ----
    const payrollData = [
      { k: 'pn', base: '₹85,000', ded: '₹12,750', net: '₹72,250', status: 'Paid' },
      { k: 'lf', base: '₹92,000', ded: '₹13,800', net: '₹78,200', status: 'Paid' },
      { k: 'so', base: '₹78,000', ded: '₹11,700', net: '₹66,300', status: 'Paid' },
      { k: 'at', base: '₹88,000', ded: '₹13,200', net: '₹74,800', status: 'Paid' },
      { k: 'mw', base: '₹95,000', ded: '₹14,250', net: '₹80,750', status: 'Pending' },
      { k: 'dr', base: '₹90,000', ded: '₹13,500', net: '₹76,500', status: 'Pending' },
    ];
    await Payroll.insertMany(payrollData.map((p) => ({
      employee: id(p.k), month: 'June', year: 2026, baseSalary: p.base,
      deductions: p.ded, netPay: p.net, status: p.status,
      paidAt: p.status === 'Paid' ? new Date('2026-06-01') : undefined,
    })));

    // ---- Notifications (HR notif panel) ----
    const notifs = [
      { recipient: id('sarah'), type: 'leave_request', title: 'Leave request — Priya Nair', message: 'Sick leave · Jun 12–13 · 2 days', isRead: false },
      { recipient: id('sarah'), type: 'payslip', title: 'Payslip request — Marcus Webb', message: 'May 2026 payslip requested', isRead: false },
      { recipient: id('sarah'), type: 'attendance', title: 'Late login — Lena Fischer', message: 'Logged in at 10:42 AM (30 min late)', isRead: false },
      { recipient: id('sarah'), type: 'attendance', title: 'Missing logout — Sam Osei', message: 'No logout recorded for Jun 7', isRead: false },
    ];
    await Notification.insertMany(notifs);

    console.log('Data Imported!');
    if (require.main === module) process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    if (require.main === module) process.exit(1);
  }
};

if (require.main === module) seedData();

module.exports = seedData;
