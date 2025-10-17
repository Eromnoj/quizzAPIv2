import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function seed() {
  const basePath = path.resolve(__dirname);

  /* 
  ** "categories.json" entries must respect this template 
  ** 
  [
      {
        "name": "musique",
        "slug": "musique"
      },
      {
        "name": "TV et cinéma",
        "slug": "tv_cinema"
      },
      {
        "name": "sport",
        "slug": "sport"
      },
  ]
  **
  **
  */

  // ** For first seeding uncomment this part to seed your categories. 
  // const categories = JSON.parse(await fs.readFile(path.join(basePath, 'categories.json'), 'utf-8'));
  
  /*
    ** "questions.json" entries must respect this template, the category must be one the slugs you chose ealier
  ** 
  [
    {
        "question": "En quelle année les jeux FIFA Football ont-ils commencé à être édités ?",
        "answer": "1993",
        "category": "jeux_videos",
        "difficulty": "facile",
        "badAnswers": [
            "1994",
            "1998",
            "2000"
        ]
    },
    {
        "question": "Que signifie chez les Ch’tis le mot babache ?",
        "answer": "Une personne idiote",
        "category": "culture_generale",
        "difficulty": "normal",
        "badAnswers": [
            "Une personne bavarde",
            "Une personne peureuse",
            "Une personne gourmande"
        ]
    }
  ]
  **
  **
  */
  const questions = JSON.parse(await fs.readFile(path.join(basePath, 'questions.json'), 'utf-8'));


  // ** For first seeding uncomment this part to seed your categories.
  // const isEmptyCategory = await prisma.category.findMany();
  // if (isEmptyCategory.length === 0) {
  //   await prisma.category.createMany({ data: categories });
  //   console.log('✅ Categories seeded');
  // } else {
  //   console.log('⚠️ Categories already seeded');
  // }

  // ** For first seeding uncomment this part to seed your questions.
  // const isEmptyQuestion = await prisma.quiz.findMany();
  // if (isEmptyQuestion.length === 0) {

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
        pending: true, // Pass it to false if you your questions to be immediatly available
      };
    }));


    await prisma.quiz.createMany({ data: formattedQuestions });
    console.log('✅ Questions seeded');
    // ** For first seeding uncomment this part to seed your questions.
  // } else {
  //   console.log('⚠️ Questions already seeded');
  // }


  console.log('✅ Seed completed');
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());


