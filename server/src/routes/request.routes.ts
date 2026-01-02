import express, { Router } from "express";
import { createRequestHandler, getPendingRequestsHandler } from "../controller/request.controller";
import { requireRole } from "../middleware/authorization.middleware";
import { Role } from "../generated/prisma/enums";

const requestRouter: Router = express.Router();

requestRouter.get("/pending", requireRole(Role.HOD, Role.PROFESSOR), getPendingRequestsHandler);
requestRouter.post("/createreq", requireRole(Role.HOD, Role.PROFESSOR), createRequestHandler);

export default requestRouter;