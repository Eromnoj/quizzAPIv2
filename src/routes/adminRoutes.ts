import { Router } from "express";
import { getUserById, getUsers, createUser, deleteUser, updateUserRole } from "../controllers/adminControllers";
import { authMW, adminMW } from "../middleware/authMiddleware";
import {createCategory,updateCategory,deleteCategory } from "../controllers/categoryControllers";

const adminRoute= Router();

adminRoute.get("/users", authMW, adminMW, getUsers);
adminRoute.get("/users/:id", authMW, adminMW, getUserById);
adminRoute.post("/users", authMW, adminMW, createUser);
adminRoute.delete("/users/:id", authMW, adminMW, deleteUser);
adminRoute.put("/users/:id/role", authMW, adminMW, updateUserRole);

adminRoute.post("/categories", authMW, adminMW, createCategory);
adminRoute.put("/categories/:id", authMW, adminMW, updateCategory);
adminRoute.delete("/categories/:id", authMW, adminMW, deleteCategory);

export default adminRoute;
