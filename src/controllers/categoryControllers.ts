//Manage Users
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true
      },
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des catégories' });
  }
}

export const createCategory = async (req: Request, res: Response) => {
  const { name } = req.body;
  try {
    const category = await prisma.category.create({
      data: {
        name,
        slug: name.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '_')
          .replace(/[^\w-]+/g, '')
      },
    });
    res.status(201).json({ message: 'Catégorie créée avec succès', category });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de la catégorie' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  const categoryId = req.params.id;
  try {
    const category = await prisma.category.delete({
      where: { id: categoryId },
    });
    res.status(200).json({ message: 'Catégorie supprimée avec succès', category });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la catégorie' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  const categoryId = req.params.id;
  const { name } = req.body;

  try {
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: { name },
    });
    res.status(200).json({ message: 'Catégorie mise à jour', category: updatedCategory });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la catégorie' });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  const categoryId = req.params.id;
  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: {
        id: true,
        name: true,
      },
    });
    if (!category) {
      res.status(404).json({ message: 'Catégorie non trouvée' });
      return
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la catégorie' });
  }
};