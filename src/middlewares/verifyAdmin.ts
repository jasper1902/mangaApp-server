import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AdminAuthRequest extends Request {
  userId: string;
  userEmail: string;
  userRole: string;
}

const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader: string | undefined = getAuthHeader(req.headers);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    const tokenConfig = process.env.TOKEN;
    if (!tokenConfig || typeof tokenConfig !== "string") {
      return res.status(500).json({ message: "Token is not configured" });
    }

    const decoded = jwt.verify(token, tokenConfig) as JwtPayload;

    if (typeof decoded === "object" && "user" in decoded) {
      if (typeof decoded.user === "object" && decoded.user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "You don't have permission to access" });
      }

      const extendedReq = req as AdminAuthRequest;
      extendedReq.userId = decoded.user.id as string;
      extendedReq.userEmail = decoded.user.email as string;
      extendedReq.userRole = decoded.user.role as "admin";
      next();
    } else {
      throw new Error("Invalid token payload");
    }
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid token" });
  }
};

const getAuthHeader = (headers: any): string | undefined => {
  const authHeader =
    headers.authorization ||
    headers.Authorization ||
    headers["auth-token"] ||
    headers["Auth-token"];

  if (Array.isArray(authHeader)) {
    return authHeader[0];
  }

  return authHeader;
};

export default verifyAdmin;
