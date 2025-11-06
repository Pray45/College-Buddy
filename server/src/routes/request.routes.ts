import express, { Router } from "express";
import { createRequestHandler, getPendingRequestsHandler } from "../controller/request.controller";

const requestRouter: Router = express.Router();

requestRouter.get("/pending", getPendingRequestsHandler);
requestRouter.post("/createreq", createRequestHandler);

export default requestRouter;