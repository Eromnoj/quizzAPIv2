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
const cors = require('cors');

const allowedOrigins = [
  process.env.FRONTEND_URL,
process.env.DEVELOPMENT_FRONTEND_URL,
];
const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

const quizzRoute= Router();

quizzRoute.post("/", cors(), createQuiz);
quizzRoute.get("/",cors(), getFilteredQuizzes);
quizzRoute.get("/categories",  cors(corsOptions), getCategories);
quizzRoute.get("/categories/:id",  cors(corsOptions),getCategoryById);
quizzRoute.get("/pending",  cors(corsOptions), authMW, adminMW, getPendingQuizzes);
quizzRoute.get("/getAll",  cors(corsOptions), authMW, adminMW, getAllQuizzes);
quizzRoute.get("/:id", cors(), getOneQuiz);
quizzRoute.put("/:id", cors(corsOptions), authMW, adminMW, updateQuiz);
quizzRoute.delete("/:id",  cors(corsOptions), authMW, adminMW, deleteQuiz);


export default quizzRoute;
