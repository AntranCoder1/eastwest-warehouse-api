import { NextFunction } from "connect";
import { Request, Response } from "express";
import * as jwtUtil from "../utils/jwt.util";
import * as worker_managermentRepo from "../repositories/worker_managerment.repo";

const jwt = async (req: Request, res: Response, next: NextFunction) => {
  if (req.headers["x-token"]) {
    const token = req.headers["x-token"].toString();
    try {
      const user: any = jwtUtil.verify(token);
      const findUserId = await worker_managermentRepo.findById(user._id);

      if (findUserId) {
        if (user && findUserId.token === token) {
          req.body.user = user;
          next();
          return;
        } else if (user) {
          req.body.user = user;
          next();
          return;
        } else {
          res.status(401);
          res.send("Unauthorized");
        }
      }

      if (user) {
        req.body.user = user;
        next();
        return;
      } else {
        res.status(401);
        res.send("Unauthorized");
      }
    } catch (exception) {
      res.status(401);
      res.send("Unauthorized");
    }
  } else {
    res.status(401);
    res.send("Unauthorized");
  }
};

export default jwt;
