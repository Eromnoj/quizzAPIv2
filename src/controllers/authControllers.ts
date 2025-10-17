import { NextFunction, Request, Response } from "express";
import { registerUser } from "../database/users";
import { PrismaClient } from '@prisma/client'
import { usersValidator } from "../utils/validator";
import passport from "passport";

const prisma = new PrismaClient()

export const register = async (req: Request, res: Response) => {
  try {
    usersValidator(req.body);

    registerUser(req.body)
      .then(async (user) => {
        res.status(201).send({ message: "Utilisateur créé avec succès", user });
        await prisma.$disconnect()
      })
      .catch(async (e: Error) => {
        res.status(400).send({ message: e });
        await prisma.$disconnect()
      })
  } catch (error: any) {
    res.status(403).send({ error: "Erreur lors de l'enregistrement", message: error.message });
  }

}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    'local',
    (err: Error | null, user: Express.User | undefined, info: any) => {
      if (err) {
        //  Handle error ;
        res.status(500).send({ message: "Erreur d'authentification" });
      }

      if (!user) {
        res.status(401).send(info);
      }
      if (user)
        req.logIn(user, (err) => {
          console.log('user', user)
          if (err) {
            return next(err);
          }
          res.status(200).send({ message: "Utilisateur trouvé", user });
        }
        );
    })(req, res, next);
}

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  req.logout(function(err) {
    if (err) { 
      console.log('err', err)
      return next(err); }
  });
  req.session = null;
  res.clearCookie('api-auth'); 
  res.clearCookie('api-auth.sig'); 
  res.status(200).send({ message: "Logout" });
}