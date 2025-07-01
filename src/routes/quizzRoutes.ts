import { Router } from "express";
import { authMW, adminMW } from "../middleware/authMiddleware";
import { 
  getAllQuizzes, 
  createQuiz, 
  getOneQuiz,
  updateQuiz, 
  deleteQuiz, 
  getFilteredQuizzes, 
  getPendingQuizzes 
} from "../controllers/quizzControllers";
import { getCategories, getCategoryById } from "../controllers/categoryControllers";

const quizzRoute= Router();

quizzRoute.post("/", createQuiz);
quizzRoute.get("/", getFilteredQuizzes);
quizzRoute.get("/categories", getCategories);
quizzRoute.get("/categories/:id", getCategoryById);
quizzRoute.get("/pending", authMW, adminMW, getPendingQuizzes);
quizzRoute.get("/getAll",authMW, adminMW, getAllQuizzes);
quizzRoute.get("/:id", getOneQuiz);
quizzRoute.put("/:id", authMW, adminMW, updateQuiz);
quizzRoute.delete("/:id", authMW, adminMW, deleteQuiz);


export default quizzRoute;
