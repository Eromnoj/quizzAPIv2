import { Router } from "express";

import { sendRecoveryEmail, recoverPassword } from "../controllers/recoveryControllers";

const recoveryRouter= Router();

recoveryRouter.get("/send-mail", sendRecoveryEmail);
recoveryRouter.post("/recover-password", recoverPassword);

export default recoveryRouter;
