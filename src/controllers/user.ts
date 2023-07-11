import { RequestHandler } from "express";
import Joi from "joi";
import User from "../models/User";
import bcrypt from "bcrypt";
import { AuthRequest } from "../middlewares/verifyJWT";
import Manga from "../models/Manga";

interface UserRegisterReq {
  user: {
    email: string;
    password: string;
    username: string;
  };
}

export const register: RequestHandler<
  unknown,
  unknown,
  UserRegisterReq,
  unknown
> = async (req, res, next) => {
  try {
    const { email, password, username } = req.body.user;

    const userJoiSchema = Joi.object({
      username: Joi.string().alphanum().min(4).max(32).required(),
      password: Joi.string().min(6).required(),
      email: Joi.string().email().required(),
    });

    const { error } = userJoiSchema.validate({ email, password, username });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const emailAlreadyExists = await User.findOne({ email: email });
    const usernameAlreadyExists = await User.findOne({
      username: username,
    });

    if (emailAlreadyExists) {
      return res.status(409).json({ message: "Email already exists" });
    }

    if (usernameAlreadyExists) {
      return res.status(409).json({ message: "Username already exists" });
    }

    let hashPassword;
    try {
      hashPassword = await bcrypt.hash(password, 10);
      const userObj = {
        username: username,
        email: email,
        password: hashPassword,
      };

      await User.create(userObj);

      return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error occurred while hashing password" });
    }
  } catch (catchedError) {
    next(catchedError);
  }
};

interface UserLoginReq {
  user: {
    identifier: string;
    password: string;
  };
}

export const login: RequestHandler<
  unknown,
  unknown,
  UserLoginReq,
  unknown
> = async (req, res, next) => {
  try {
    const { identifier, password } = req.body.user;

    const userJoiSchema = Joi.object({
      password: Joi.string().min(6).required(),
      identifier: Joi.string().required(),
    });

    const { error } = userJoiSchema.validate({ identifier, password });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const userAccount = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    if (!userAccount) {
      return res
        .status(404)
        .json({ message: "email or password is incorrect" });
    }

    const validPassword = await bcrypt.compare(password, userAccount.password);

    if (!validPassword) {
      return res
        .status(400)
        .json({ message: "email or password is incorrect" });
    }

    return res.status(200).json({ user: userAccount.toUserResponse() });
  } catch (error) {
    next(error);
  }
};

export const getcurrentUser: RequestHandler = async (req, res, next) => {
  try {
    const newReq = req as unknown as AuthRequest;
    const user = await User.findById(newReq.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: await user.toUserResponse(),
    });
  } catch (catchedError) {
    next(catchedError);
  }
};
