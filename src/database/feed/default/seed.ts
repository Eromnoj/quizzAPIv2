import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function seed() {
  const basePath = path.resolve(__dirname);

  const categories = JSON.parse(await fs.readFile(path.join(basePath, 'categories.json'), 'utf-8'));
  const questions = JSON.parse(await fs.readFile(path.join(basePath, 'questions.json'), 'utf-8'));

  console.log('Seeding database...', questions);
  const isEmptyCategory = await prisma.category.findMany();
  if (isEmptyCategory.length === 0) {
    await prisma.category.createMany({ data: categories });
    console.log('✅ Categories seeded');
  } else {
    console.log('⚠️ Categories already seeded');
  }

  const isEmptyQuestion = await prisma.quiz.findMany();
  if (isEmptyQuestion.length === 0) {

    let formattedQuestions = await Promise.all(questions.map(async (question: any) => {
      const category = await prisma.category.findFirst({
        where: { slug: question.category },
        select: { id: true },
      });

      if (!category) {
        throw new Error(`Category ${question.category} not found`);
      }
      question.categoryId = category.id;
      console.log(`Category ID for question "${question.question}": ${question.categoryId}`);
      return {
        question: question.question,
        answer: question.answer,
        badAnswer1: question.badAnswers[0],
        badAnswer2: question.badAnswers[1],
        badAnswer3: question.badAnswers[2],
        categoryId: question.categoryId,
        difficulty: question.difficulty,
        pending: false, // Assuming all questions are not pending by default
      };
    }));


    await prisma.quiz.createMany({ data: formattedQuestions });
    console.log('✅ Questions seeded');
  } else {
    console.log('⚠️ Questions already seeded');
  }
 

  console.log('✅ Seed completed');
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
