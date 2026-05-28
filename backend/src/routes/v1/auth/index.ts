import express from "express";
import { signupHandler } from "./handler";
import { validateSignupRequestBody } from "./prehandler";
const route = express.Router();

route.post("/signup", validateSignupRequestBody, signupHandler);
export default route;
