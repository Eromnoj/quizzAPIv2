import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createQuizReport(quizId: string, reason: string) {
  return prisma.quizReport.create({
    data: {
      quizId,
      reason,
    },
  });
}
