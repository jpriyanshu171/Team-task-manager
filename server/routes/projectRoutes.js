const express = require("express");
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember
} = require("../controllers/projectController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .post(authorizeRoles("Admin"), createProject)
  .get(getProjects);

router
  .route("/:id")
  .get(getProjectById)
  .put(authorizeRoles("Admin"), updateProject)
  .delete(authorizeRoles("Admin"), deleteProject);

router.post("/:id/members", authorizeRoles("Admin"), addTeamMember);
router.delete("/:id/members/:userId", authorizeRoles("Admin"), removeTeamMember);

module.exports = router;
