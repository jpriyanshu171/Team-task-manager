const Project = require("../models/Project");
const Task = require("../models/Task");
const asyncHandler = require("../utils/asyncHandler");

const populateTask = [
  { path: "assignedTo", select: "name email role" },
  { path: "project", select: "name description teamMembers" }
];

const ensureProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);

  if (!project) {
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  const isMember = project.teamMembers.some((member) => member.toString() === userId.toString());
  if (!isMember) {
    const error = new Error("You are not a member of this project");
    error.statusCode = 403;
    throw error;
  }

  return project;
};

const ensureAssignedUserBelongsToProject = (project, assignedTo) => {
  const belongsToProject = project.teamMembers.some(
    (member) => member.toString() === assignedTo.toString()
  );

  if (!belongsToProject) {
    const error = new Error("Assigned user must belong to the project");
    error.statusCode = 400;
    throw error;
  }
};

const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, assignedTo, project: projectId, dueDate } = req.body;

  if (!title || !assignedTo || !projectId) {
    res.status(400);
    throw new Error("Title, assignedTo and project are required");
  }

  const project = await ensureProjectAccess(projectId, req.user._id);
  ensureAssignedUserBelongsToProject(project, assignedTo);

  const task = await Task.create({
    title,
    description,
    status,
    assignedTo,
    project: projectId,
    dueDate
  });

  const populatedTask = await Task.findById(task._id).populate(populateTask);
  res.status(201).json(populatedTask);
});

const getTasks = asyncHandler(async (req, res) => {
  const { project, status } = req.query;
  const accessibleProjects = await Project.find({ teamMembers: req.user._id }).select("_id");
  const accessibleProjectIds = accessibleProjects.map((item) => item._id);

  const query = { project: { $in: accessibleProjectIds } };

  if (project) {
    await ensureProjectAccess(project, req.user._id);
    query.project = project;
  }

  if (status) {
    query.status = status;
  }

  const tasks = await Task.find(query).populate(populateTask).sort({ createdAt: -1 });
  res.json(tasks);
});

const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate(populateTask);

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  await ensureProjectAccess(task.project._id, req.user._id);
  res.json(task);
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  const project = await ensureProjectAccess(task.project, req.user._id);
  const { title, description, status, assignedTo, dueDate } = req.body;

  if (assignedTo) {
    ensureAssignedUserBelongsToProject(project, assignedTo);
    task.assignedTo = assignedTo;
  }

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (dueDate !== undefined) task.dueDate = dueDate;

  const updatedTask = await task.save();
  const populatedTask = await Task.findById(updatedTask._id).populate(populateTask);
  res.json(populatedTask);
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  await ensureProjectAccess(task.project, req.user._id);
  await task.deleteOne();
  res.json({ message: "Task deleted" });
});

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
};
