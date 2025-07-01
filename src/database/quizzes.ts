import { Difficulty, PrismaClient, Role } from '@prisma/client'
import { count } from 'console';
const prisma = new PrismaClient()

export async function getQuizzes() {
  const quizzes = await prisma.quiz.findMany();

  const retQizzes = quizzes.map(async (quiz) => {
    return {
      id: quiz.id,
      question: quiz.question,
      answer: quiz.answer,
      categoryId: quiz.categoryId,
      difficulty: quiz.difficulty,
      badAnswers: [
        quiz.badAnswer1,
        quiz.badAnswer2,
        quiz.badAnswer3,
      ]
    }
  });

  return retQizzes;
}

export async function createQuizz(data: any) {
  const quiz = await prisma.quiz.create({
    data: {
      question: data.question,
      answer: data.answer,
      categoryId: data.categoryId,
      difficulty: data.difficulty,
      badAnswer1: data.badAnswer1,
      badAnswer2: data.badAnswer2,
      badAnswer3: data.badAnswer3,
      pending: data.pending || false, // default to false if not provided
    },
  });
  return quiz;
}

export async function deleteQuizz(id: string) {
  const quiz = await prisma.quiz.delete({
    where: { id },
  });
  return quiz;
}

export async function updateQuizz(id: string, data: any) {
  const updatedQuiz = await prisma.quiz.update({
    where: { id },
    data: {
      question: data.question,
      answer: data.answer,
      categoryId: data.categoryId,
      difficulty: data.difficulty,
      badAnswer1: data.badAnswer1,
      badAnswer2: data.badAnswer2,
      badAnswer3: data.badAnswer3,
    },
    include: {
      category: true, // include category information if needed
    },
  });
  return updatedQuiz;
}
export async function getQuizzById(id: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { id },
  });
  return quiz;
}

export async function getQuizzesFiltered(data: { difficulty: Difficulty, categoryId: string, maxResults: number, categorySlug?: string }) {

  // if no maxResults is provided, default to 5
  if (!data.maxResults || data.maxResults <= 0) {
    data.maxResults = 5;
  }

  console.log('getQuizzesFiltered', data);
  //where construction if no difficculty or categoryId is provided take from all quizzes
  const where: any = {};
  if (data.difficulty) {
    where.difficulty = data.difficulty;
  }
  if (data.categoryId) {
    where.categoryId = data.categoryId;
  }
  where.pending = false; // only get quizzes that are not pending
  // get quizzes randomly from all quizzes with the given difficulty and categoryId
  const quizzes = await prisma.quiz.findMany({
    where
  });

  let retQuizzes = quizzes.map((quiz) => {
    return {
      id: quiz.id,
      question: quiz.question,
      answer: quiz.answer,
      categoryId: quiz.categoryId,
      difficulty: quiz.difficulty,
      badAnswers: [
        quiz.badAnswer1,
        quiz.badAnswer2,
        quiz.badAnswer3,
      ]
    };
  });
  // shuffle the quizzes and take the first maxResults
  const shuffledQuizzes = retQuizzes.sort(() => 0.5 - Math.random());
  if (shuffledQuizzes.length > data.maxResults) {
    return {
      count: shuffledQuizzes.length,
      quizzes:
        shuffledQuizzes.slice(0, data.maxResults)
    };
  }
  // if there are not enough quizzes, return all of them
  if (shuffledQuizzes.length === 0) {
    return {
      count: shuffledQuizzes.length,
      quizzes: []
    };
  }
  // if there are not enough quizzes, return all of them
  if (shuffledQuizzes.length < data.maxResults) {
    return {
      count: shuffledQuizzes.length,
      quizzes: shuffledQuizzes
    };
  }
}

export async function getQuizzesPending() {
  const quizzes = await prisma.quiz.findMany({
    where: {
      pending: true,
    },
  });
  return quizzes;
}