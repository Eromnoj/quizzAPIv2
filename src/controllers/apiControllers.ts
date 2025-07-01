import { Request, Response } from "express";
import { PrismaClient, User } from '@prisma/client'


const prisma = new PrismaClient()
import { doubleCsrf } from "csrf-csrf";
const {
  invalidCsrfTokenError, // This is just for convenience if you plan on making your own middleware.
  generateToken, // Use this in your routes to provide a CSRF hash + token cookie and token.
  validateRequest, // Also a convenience if you plan on making your own middleware.
  doubleCsrfProtection, // This is the default CSRF protection middleware.
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || 'default_csrf_secret',
  cookieName: 'csrf-token',
  cookieOptions: {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  }
});

export const apiRouteTest = async (req: Request, res: Response) => {
  res.status(200).send({ message: "Hello from API Route!" });
}

export const getCsrf = async (req: Request, res: Response) => {
  const token = generateToken(req, res);
  res.status(200).send({ token: token });
}

export const user = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(403).send({ message: "Forbidden" });
  } else {
    const user = await prisma.user.findUnique({
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      },
      where: {
        id: req.user.id
      }
    })

    res.status(200).send({ message: "Hello User!", user: user });
  }
}