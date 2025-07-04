//manage Quizzes

import { Request, Response } from 'express';
import { Difficulty, PrismaClient } from '@prisma/client';
import { validateQuizz } from '../utils/validator';
import { createQuizz, deleteQuizz, getQuizzById, getQuizzes, updateQuizz, getQuizzesFiltered,getQuizzesPending } from '../database/quizzes';
const prisma = new PrismaClient();

export const getAllQuizzes = async (req: Request, res: Response) => {
  try {
    const quizzes = await getQuizzes();
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur lors de la récupération des quiz' });
  }
};
export const createQuiz = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      req.body.pending = true; // If user is not admin, set quiz as pending
    }
    validateQuizz(req.body);
    const quiz = await createQuizz(req.body);
    res.status(201).json({ msg: 'Votre question a bien été soumise et est en attente de modération, Merci !', quiz });
  } catch (error: any) {
    res.status(400).json({ msg: 'Erreur lors de la création du quiz', error: error.msg });
  }
};
export const deleteQuiz = async (req: Request, res: Response) => {
  const quizId = req.params.id;
  try {
    const quiz = await deleteQuizz(quizId);
    res.status(200).json({ msg: 'Quiz supprimé avec succès', quiz });
  } catch (error) {
    res.status(500).json({ msg: 'Erreur lors de la suppression du quiz' });
  }
};
export const updateQuiz = async (req: Request, res: Response) => {
  const quizId = req.params.id;
  try {
    validateQuizz(req.body);
    const updatedQuiz = await updateQuizz(quizId, req.body);
    res.status(200).json({ msg: 'Quiz mis à jour', quiz: updatedQuiz });
  } catch (error) {
    res.status(500).json({ msg: 'Erreur lors de la mise à jour du quiz' });
  }
}

export const getOneQuiz = async (req: Request, res: Response) => {
  const quizId = req.params.id;
  try {
    const quiz = await getQuizzById(quizId);
    if (!quiz) {
      res.status(404).json({ msg: 'Quiz non trouvé' });
      return 
    }
    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur lors de la récupération du quiz' });
  }
}

export const getFilteredQuizzes = async (req: Request, res: Response) => {
  const { difficulty, category, limit } = req.query;
  
  try {
    const quizzes = await getQuizzesFiltered({difficulty: difficulty as Difficulty, category: category as string, maxResults: Number(limit),});
    res.status(200).json(quizzes);

  } catch (error: any) {
    res.status(500).json({ msg: 'Erreur lors de la récupération des quiz filtrés', error: error.msg });
  }
};

export const getPendingQuizzes = async (req: Request, res: Response) => {
  try {
    const quizzes = await getQuizzesPending();
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur lors de la récupération des quiz en attente' });
  }
}