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
    res.status(500).json({ message: 'Erreur lors de la récupération des quiz' });
  }
};
export const createQuiz = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      req.body.pending = true; // If user is not admin, set quiz as pending
    }
    validateQuizz(req.body);
    const quiz = await createQuizz(req.body);
    res.status(201).json({ message: 'Quiz créé avec succès', quiz });
  } catch (error: any) {
    res.status(400).json({ message: 'Erreur lors de la création du quiz', error: JSON.parse(error.message) });
  }
};
export const deleteQuiz = async (req: Request, res: Response) => {
  const quizId = req.params.id;
  try {
    const quiz = await deleteQuizz(quizId);
    res.status(200).json({ message: 'Quiz supprimé avec succès', quiz });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du quiz' });
  }
};
export const updateQuiz = async (req: Request, res: Response) => {
  const quizId = req.params.id;
  try {
    validateQuizz(req.body);
    const updatedQuiz = await updateQuizz(quizId, req.body);
    res.status(200).json({ message: 'Quiz mis à jour', quiz: updatedQuiz });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du quiz' });
  }
}

export const getOneQuiz = async (req: Request, res: Response) => {
  const quizId = req.params.id;
  try {
    const quiz = await getQuizzById(quizId);
    if (!quiz) {
      res.status(404).json({ message: 'Quiz non trouvé' });
      return 
    }
    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du quiz' });
  }
}

export const getFilteredQuizzes = async (req: Request, res: Response) => {
  const { difficulty, category, limit } = req.query;

  console.log('Difficulty:', difficulty);
  console.log('Category:', category);
  console.log('Limit:', limit);
  const categoryId = await prisma.category.findFirst({
    where: {
      slug: category as string ?? null,
    },
    select: {
      id: true,
    },
  });
  try {
    const quizzes = await getQuizzesFiltered({difficulty: difficulty as Difficulty, categoryId: categoryId?.id as string, maxResults: Number(limit), categorySlug: category as string });
    res.status(200).json(quizzes);

  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des quiz filtrés' });
  }
};

export const getPendingQuizzes = async (req: Request, res: Response) => {
  try {
    const quizzes = await getQuizzesPending();
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des quiz en attente' });
  }
}