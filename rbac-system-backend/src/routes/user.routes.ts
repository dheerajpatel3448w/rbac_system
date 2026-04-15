import { Router } from "express";
import {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getMyProfile,
  updateMyProfile,
} from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { Role } from "../utils/constants.js";
import {
  createUserSchema,
  updateUserSchema,
  updateProfileSchema,
  paginationSchema,
} from "../utils/validators/user.validator.js";

const router = Router();


router.use(verifyToken);


 
router.get("/profile", getMyProfile);
router.patch("/profile", validate(updateProfileSchema), updateMyProfile);


router.get(
  "/",
  authorizeRoles(Role.ADMIN, Role.MANAGER),
  validate(paginationSchema, "query"),
  getAllUsers
);


router.get("/:id", authorizeRoles(Role.ADMIN, Role.MANAGER), getUserById);


router.post("/", authorizeRoles(Role.ADMIN), validate(createUserSchema), createUser);


 
router.patch(
  "/:id",
  authorizeRoles(Role.ADMIN, Role.MANAGER),
  validate(updateUserSchema),
  updateUser
);


router.delete("/:id", authorizeRoles(Role.ADMIN), deleteUser);

export default router;
