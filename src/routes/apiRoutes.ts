import { Router } from "express";
import { getCsrf, user, apiRouteTest } from "../controllers/apiControllers";

import { authMW } from "../middleware/authMiddleware";

const apiRoute= Router();

apiRoute.get("/csrf", getCsrf);
apiRoute.get("/user",authMW, user);
apiRoute.get("/test", apiRouteTest);

export default apiRoute;
