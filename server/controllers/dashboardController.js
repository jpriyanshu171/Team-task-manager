const Project = require("../models/Project");
const Task = require("../models/Task");
const asyncHandler = require("../utils/asyncHandler");

const getDashboard = asyncHandler(async (req, res) => {
  const projects = await Project.find({ teamMembers: req.user._id }).select("_id");
  const projectIds = projects.map((project) => project._id);

  const baseQuery = { project: { $in: projectIds } };
  const now = new Date();

  const [totalTasks, grouped, overdueTasks, assignedToMe] = await Promise.all([
    Task.countDocuments(baseQuery),
    Task.aggregate([
      { $match: baseQuery },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]),
    Task.find({
      ...baseQuery,
      dueDate: { $lt: now },
      status: { $ne: "Done" }
    })
      .populate("assignedTo", "name email role")
      .populate("project", "name"),
    Task.find({ ...baseQuery, assignedTo: req.user._id })
      .populate("assignedTo", "name email role")
      .populate("project", "name")
      .sort({ dueDate: 1 })
  ]);

  const tasksByStatus = {
    Todo: 0,
    "In Progress": 0,
    Done: 0
  };

  grouped.forEach((item) => {
    tasksByStatus[item._id] = item.count;
  });

  res.json({
    totalTasks,
    tasksByStatus,
    overdueTasks,
    assignedToMe
  });
});

module.exports = { getDashboard };
