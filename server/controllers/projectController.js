const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const populateProject = [
  { path: "createdBy", select: "name email role" },
  { path: "teamMembers", select: "name email role" }
];

const isProjectMember = (project, userId) => {
  return project.teamMembers.some((member) => member.toString() === userId.toString());
};

const getProjectOrFail = async (projectId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }
  return project;
};

const createProject = asyncHandler(async (req, res) => {
  const { name, description, teamMembers = [] } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Project name is required");
  }

  const uniqueMemberIds = [...new Set([req.user._id.toString(), ...teamMembers])];
  const users = await User.find({ _id: { $in: uniqueMemberIds } });

  if (users.length !== uniqueMemberIds.length) {
    res.status(400);
    throw new Error("One or more team members do not exist");
  }

  const project = await Project.create({
    name,
    description,
    createdBy: req.user._id,
    teamMembers: uniqueMemberIds
  });

  const populatedProject = await Project.findById(project._id).populate(populateProject);
  res.status(201).json(populatedProject);
});

const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ teamMembers: req.user._id })
    .populate(populateProject)
    .sort({ updatedAt: -1 });

  res.json(projects);
});

const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate(populateProject);

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  if (!isProjectMember(project, req.user._id)) {
    res.status(403);
    throw new Error("You are not a member of this project");
  }

  res.json(project);
});

const updateProject = asyncHandler(async (req, res) => {
  const project = await getProjectOrFail(req.params.id);
  const { name, description, teamMembers } = req.body;

  if (name !== undefined) project.name = name;
  if (description !== undefined) project.description = description;

  if (teamMembers !== undefined) {
    const uniqueMemberIds = [...new Set([project.createdBy.toString(), ...teamMembers])];
    const users = await User.find({ _id: { $in: uniqueMemberIds } });

    if (users.length !== uniqueMemberIds.length) {
      res.status(400);
      throw new Error("One or more team members do not exist");
    }

    project.teamMembers = uniqueMemberIds;
  }

  const updatedProject = await project.save();
  const populatedProject = await Project.findById(updatedProject._id).populate(populateProject);
  res.json(populatedProject);
});

const deleteProject = asyncHandler(async (req, res) => {
  const project = await getProjectOrFail(req.params.id);
  await Task.deleteMany({ project: project._id });
  await project.deleteOne();
  res.json({ message: "Project and related tasks deleted" });
});

const addTeamMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400);
    throw new Error("userId is required");
  }

  const [project, user] = await Promise.all([
    getProjectOrFail(req.params.id),
    User.findById(userId)
  ]);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (!isProjectMember(project, userId)) {
    project.teamMembers.push(userId);
    await project.save();
  }

  const populatedProject = await Project.findById(project._id).populate(populateProject);
  res.json(populatedProject);
});

const removeTeamMember = asyncHandler(async (req, res) => {
  const project = await getProjectOrFail(req.params.id);
  const { userId } = req.params;

  if (project.createdBy.toString() === userId) {
    res.status(400);
    throw new Error("Project creator cannot be removed from the team");
  }

  project.teamMembers = project.teamMembers.filter((member) => member.toString() !== userId);
  await project.save();

  await Task.updateMany(
    { project: project._id, assignedTo: userId },
    { $set: { assignedTo: project.createdBy } }
  );

  const populatedProject = await Project.findById(project._id).populate(populateProject);
  res.json(populatedProject);
});

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember
};
