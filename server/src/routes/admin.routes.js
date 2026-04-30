import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { 
  loginAdmin,
  getAllUsers, 
  updateUser, 
  deleteUser
} from "../controllers/admin.controller.js";

const router = Router();

router.post("/login", loginAdmin);

// All admin routes require authentication and admin role
router.use(requireAuth, requireRole("admin"));

router.get("/users", getAllUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;
