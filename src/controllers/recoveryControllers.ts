import { transporter } from "../utils/mailer";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";
import { validatePassword } from "../utils/validator";
import { hashPassword } from "../database/users";

export const sendRecoveryEmail = async (req: Request, res: Response) => {

  const { email } = req.body;
  const token = uuidv4();
  const prisma = new PrismaClient();

  try {
    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(404).send({ message: "User not found" });
    } else {


      // Save the token in the database
      await prisma.recovery.create({
        data: {
          userId: user.id,
          token,
          email: user.email
        },
      });

      // Send the recovery email
      const recoveryLink = `${process.env.FRONTEND_URL}/recovery/${token}`;
      await transporter.sendMail({
        from: process.env.SMTP_USER, // sender address
        to: email, // list of receivers
        subject: "Password Recovery", // Subject line
        text: `Click on this link to recover your password: ${recoveryLink}`, // plain text body
        html: `<b>Click on this link to recover your password:</b> <a href="${recoveryLink}">${recoveryLink}</a>`, // html body
      });

      res.status(200).send({
        message: "Recovery email sent",
        token: token, // Optionally return the token for further use
        recoveryLink: recoveryLink // Optionally return the recovery link
      });
    }
  } catch (error) {
    console.error("Error sending recovery email:", error);
    res.status(500).send({ message: "Error sending recovery email", error });
  } finally {
    await prisma.$disconnect();
  }

}

export const recoverPassword = async (req: Request, res: Response) => {
  const { token, email, newPassword } = req.body;
  const prisma = new PrismaClient();

  try {
    // Find the recovery token in the database
    const recovery = await prisma.recovery.findFirst({
      where: { token, email },
    });

    if (!recovery) {
      res.status(404).send({ message: "Invalid or expired token" });
    } else {
      // Update the user's password
      if (!recovery.userId) {
        res.status(400).send({ message: "Invalid recovery record: missing userId" });
      } else {
        // Validate the new password
        validatePassword(newPassword);

        await prisma.user.update({
          where: { id: recovery.userId },
          data: { password: hashPassword(newPassword) }, // Ensure to hash the password before saving
        });

        // Delete the recovery token
        await prisma.recovery.deleteMany({
          where: { token },
        });

        res.status(200).send({ message: "Password updated successfully" });
      }
    }
  } catch (error :  any) {
    console.error("Error recovering password:", error);
    res.status(500).send({ message: "Error recovering password", error : error.message });
  } finally {
    await prisma.$disconnect();
  }
}