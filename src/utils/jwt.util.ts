import jwt from "jsonwebtoken";
import config from "../config/db.config";

export let sign = (info) => {
  return jwt.sign(JSON.stringify(info), config.JWT_SECRET);
};

export let verify = (token) => {
  return jwt.verify(token, config.JWT_SECRET);
};
