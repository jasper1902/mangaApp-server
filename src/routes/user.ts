import express, { Router } from "express";
import { getUsername, getcurrentUser, login, register } from "../controllers/user";
import verifyJWT from "../middlewares/verifyJWT";

const router: Router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/getme", verifyJWT, getcurrentUser);
router.post("/getusername", getUsername)

export default router;
