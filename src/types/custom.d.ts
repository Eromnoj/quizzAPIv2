import { User as PrismaUser, Role } from '@prisma/client';

type UserCookie = {
  id: string;
  role?: Role;
};
declare global {
  namespace Express {
    interface User extends UserCookie {}
  }
}