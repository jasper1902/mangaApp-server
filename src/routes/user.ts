import express, { Router } from "express";
import {
  getUserById,
  getcurrentUser,
  login,
  register,
} from "../controllers/user";
import verifyJWT from "../middlewares/verifyJWT";

const router: Router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/getme", verifyJWT, getcurrentUser);
router.get("/userid/:userId", getUserById);

export default router;

// Register
/**
 * @swagger
 * /api/account/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with the provided email, password, and username.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags: [Account]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UserRegister"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad Request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       409:
 *         description: Conflict - Email or username already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal Server Error - Error occurred while processing the request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserRegister:
 *       type: object
 *       properties:
 *         user:
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *               example: johndoe
 *             email:
 *               type: string
 *               example: john@example.com
 *             password:
 *               type: string
 *               example: Password123
 */

// Login
/**
 * @swagger
 * /api/account/login:
 *   post:
 *     summary: User Login
 *     description: Authenticate user and return user data on successful login.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags: [Account]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UserLoginRequest"
 *     responses:
 *       200:
 *         description: OK. User successfully logged in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   $ref: "#/components/schemas/UserResponse"
 *       400:
 *         description: Bad Request. Invalid request body.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Not Found. User account not found or incorrect login credentials.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserLoginRequest:
 *       type: object
 *       properties:
 *         user:
 *           type: object
 *           properties:
 *             identifier:
 *               type: string
 *               example: johndoe or john@example.com
 *             password:
 *               type: string
 *               example: Password123
 */

// getcurrentUser
/**
 * @swagger
 * /api/account/getme:
 *   get:
 *     summary: Get current user information
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: auth-token
 *         description: Bearer token for authentication (e.g., "token [token]")
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Token is not configured
 *       503:
 *         description: Service Unavailable
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     UserResponse:
 *       type: object
 *       properties:
 *         user:
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *             email:
 *               type: string
 *             role:
 *               type: string
 *             token:
 *               type: string
 *             image:
 *               type: string
 */

// getUserById
/**
 * @swagger
 * /api/account/userid/{userId}:
 *   get:
 *     summary: Get a user by ID
 *     description: Retrieve a user by their unique ID.
 *     tags: [Account]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response containing the user data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     image:
 *                       type: string
 *                   example:
 *                     username: john_doe
 *                     email: john.doe@example.com
 *                     role: regular
 *                     image: https://example.com/avatar.png
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: User not found
 */