import { Request, Response, NextFunction } from "express";

export const authMW = async (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    console.log("Authenticated");
    next();
  }
  else {
    console.log("Not Authenticated");
    res.status(401).send({ message: "Unauthorized" });
  }
}

export const adminMW = async (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user?.role === "ADMIN") {
    console.log("Admin Authenticated");
    next();
  }
  else {
    console.log("Not Admin Authenticated");
    res.status(401).send({ message: "Unauthorized" });
  }
}