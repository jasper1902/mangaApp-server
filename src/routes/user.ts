import express, { Router } from "express";
import {  getUserById, getcurrentUser, login, register } from "../controllers/user";
import verifyJWT from "../middlewares/verifyJWT";

const router: Router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/getme", verifyJWT, getcurrentUser);
router.get("/userid/:userId", getUserById)


export default router;
