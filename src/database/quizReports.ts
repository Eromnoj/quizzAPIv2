import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createQuizReport(quizId: string, reason: string) {
  return prisma.$transaction(async (tx) => {
    const report = await tx.quizReport.create({
      data: {
        quizId,
        reason,
      },
    });

    const reportsCount = await tx.quizReport.count({
      where: { quizId },
    });

    let pendingReset = false;
    if (reportsCount >= 5) {
      const updatedQuiz = await tx.quiz.update({
        where: { id: quizId },
        data: { pending: true },
      });
      pendingReset = updatedQuiz.pending;
    }

    return { report, reportsCount, pendingReset };
  });
}

export async function getReportedQuizzes() {
  return prisma.quiz.findMany({
    where: {
      reports: { some: {} },
    },
    include: {
      reports: {
        orderBy: { createdAt: 'asc' },
      },
      category: true,
    },
    orderBy: [
      { pending: 'desc' },
      { createdAt: 'asc' },
    ],
  });
}

export async function deleteQuizReport(reportId: string) {
  return prisma.quizReport.delete({
    where: { id: reportId },
  });
}

export async function deleteQuizReports(quizId: string) {
  return prisma.quizReport.deleteMany({
    where: { quizId },
  });
}
