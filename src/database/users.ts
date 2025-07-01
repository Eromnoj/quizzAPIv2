import { PrismaClient, Role } from '@prisma/client'
import { UserRegister } from '../types/Types'
import bcryptjs from "bcryptjs";
const salt = bcryptjs.genSaltSync(10);
const prisma = new PrismaClient()

export async function registerUser(req:UserRegister) {


  const user = await prisma.user.create({
    data: {
      name: req.name,
      email: req.email,
      password: hashPassword(req.password),
      role: req.role || Role.USER,
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
