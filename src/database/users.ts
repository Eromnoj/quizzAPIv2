import { PrismaClient, Role } from '@prisma/client'
import { UserRegister } from '../types/Types'
import bcryptjs from "bcryptjs";
const salt = bcryptjs.genSaltSync(10);
const prisma = new PrismaClient()

export async function registerUser(req:UserRegister) {

  const isFirstUser = await prisma.user.count() === 0;
  if (isFirstUser && req.role !== Role.ADMIN) {
    req.role = Role.ADMIN; // If it's the first user, set role to ADMIN
  } else {
    req.role = Role.USER; // Default to USER if not specified
  }
  const user = await prisma.user.create({
    data: {
      name: req.name,
      email: req.email,
      password: hashPassword(req.password),
      role: req.role,
    },
  })

  return user
}

export async function removeUser(id: string) {
  const user = await prisma.user.delete({
    where: {
      id: id
    }
  })

  return user
}

export function hashPassword(password: string) {
  return bcryptjs.hashSync(password, salt)
}
