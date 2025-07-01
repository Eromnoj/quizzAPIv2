import validator from 'validator';
import { UserRegister } from '../types/Types';


export const validateEmail = (email: string) => {
  if (!email || !validator.isEmail(email)) {
    throw new Error('Email invalide');
  }
};
export const validatePassword = (password: string) => {
  if (!password || !validator.isStrongPassword(password)) {
    throw new Error('Mot de passe invalide');
  }
}
export const validateName = (name: string) => {
  if (!name || !validator.isAlphanumeric(name)) {
    throw new Error('Nom invalide');
  }
}
export const usersValidator = (user: UserRegister) => {
  validateEmail(user.email);
  validatePassword(user.password);
  validateName(user.name);
}

//validate quizzes
export const validateQuizz = (quizz: any) => {
  if (!quizz.question || !validator.isLength(quizz.question, { min: 1 })) {
    throw new Error('Question invalide');
  }
  if (!quizz.answer || !validator.isLength(quizz.answer, { min: 1 })) {
    throw new Error('Réponse invalide');
  }
  if (!quizz.badAnswer1 || !validator.isLength(quizz.badAnswer1, { min: 1 })) {
    throw new Error('Mauvaise réponse 1 invalide');
  }
  if (!quizz.badAnswer2 || !validator.isLength(quizz.badAnswer2, { min: 1 })) {
    throw new Error('Mauvaise réponse 2 invalide');
  }
  if (!quizz.badAnswer3 || !validator.isLength(quizz.badAnswer3, { min: 1 })) {
    throw new Error('Mauvaise réponse 3 invalide');
  }
  if (!quizz.categoryId || !validator.isAlphanumeric(quizz.categoryId)) {
    throw new Error('ID de catégorie invalide');
  }
  if (!quizz.difficulty || !['facile', 'normal', 'difficile'].includes(quizz.difficulty)) {
    throw new Error('Difficulté invalide');
  }
}