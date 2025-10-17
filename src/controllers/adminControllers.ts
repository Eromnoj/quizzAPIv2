//Manage Users
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { usersValidator } from '../utils/validator';
import { registerUser, removeUser } from '../database/users';

const prisma = new PrismaClient();

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    usersValidator(req.body);
    const user = await registerUser(req.body);
    res.status(201).json({ message: 'Utilisateur créé avec succès', user });
  } catch (error: any) {
    res.status(400).json({ message: 'Erreur lors de la création de l\'utilisateur', error: error.message });
  }
};
export const deleteUser = async (req: Request, res: Response) => {
  const userId = req.params.id;
  try {
    const user = await removeUser(userId);
    res.status(200).json({ message: 'Utilisateur supprimé avec succès', user });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
  }
};
export const updateUserRole = async (req: Request, res: Response) => {
  const userId = req.params.id;
  const { role } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    res.status(200).json({ message: 'Rôle de l\'utilisateur mis à jour', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du rôle de l\'utilisateur' });
  }
};
export const getUserById = async (req: Request, res: Response) => {
  const userId = req.params.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    if (!user) {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
      return
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
  }
};

// Manage Categories


