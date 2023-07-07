import { Request, Response } from "express";
import { initModels } from "../models/init-models";
import fs from "fs";
import path from "path";
import config from "../config/db.config";
import { sequelize } from "../models/index";
import * as common from "../utils/common.util";
import * as jwtUtil from "../utils/jwt.util";
import nodemailer from "nodemailer";
import * as userRepo from "../repositories/user.repo";
import { worker_managerment } from "../models/worker_managerment.model";

initModels(sequelize);

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;
    const profile_image = req.body.profile_image;

    const data = {
      name,
      email,
      phone,
      password,
      profile_image,
    };

    const createNewAdmin = await userRepo.registerAdmin(data);

    if (createNewAdmin) {
      res.status(200).send({ status: "success", data: createNewAdmin });
    } else {
      res.status(400).json({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).send({
        status: "falied",
        message: "Please enter full information!!!",
      });
    }

    const checkEmail = await userRepo.findOneUserByEmail(email);

    if (checkEmail) {
      if (checkEmail !== null) {
        if (await common.comparePassword(checkEmail.password, password)) {
          const token = jwtUtil.sign({
            username: checkEmail.name,
            _id: checkEmail.id,
          });
          userRepo.updateLastLogin(checkEmail.id).then((lastLogin) => {
            return res.json({ token });
          });
        } else {
          return res.status(400).json({
            status: "failed",
            mesage:
              "User has not been validated. Please check your email and confirm your account!",
          });
        }
      } else {
        return res.status(400).json({
          status: "verify",
          mesage:
            "User has not been validated. Please check your email and confirm your account!",
        });
      }
    } else {
      return res.status(400).json({
        status: "failed",
        mesage:
          "User has not been validated. Please check your email and confirm your account!",
      });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const userId = req.body.user._id;

    userRepo
      .logout(userId)
      .then(
        (uLogout) => {
          res.status(200);
          res.json({ status: "success" });
        },
        (reason) => {
          res.status(500);
          res.json(reason);
        }
      )
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

const emailResetPasword = (email, token, name) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "thanhantran21@gmail.com", // generated ethereal user
      pass: "okifhhhxhjasrioe", // generated ethereal password
    },
  });
  const html =
    `
      <div style=" font-family: Avenir, Helvetica, sans-serif; box-sizing: border-box; background-color: #f5f8fa; color: #74787e; height: 100%; line-height: 1.4; margin: 0; width: 100% !important; word-break: break-word; ">
      <table width="100%" cellpadding="0" cellspacing="0" style=" font-family: Avenir, Helvetica, sans-serif; box-sizing: border-box; background-color: #f5f8fa; margin: 0; padding: 0; width: 100%; ">
      <tbody>
      <tr>
      <td align="center" style=" font-family: Avenir, Helvetica, sans-serif; box-sizing: border-box; ">
      <table width="100%" cellpadding="0" cellspacing="0" style=" font-family: Avenir, Helvetica, sans-serif; box-sizing: border-box; margin: 0; padding: 0; width: 100%; ">
      <tbody>
      <tr>
      <td style=" font-family: Avenir, Helvetica, sans-serif; box-sizing: border-box; padding: 25px 0; text-align: center; "> <a href="` +
    config.uiUrl +
    `/" style=" font-family: Avenir, Helvetica, sans-serif; box-sizing: border-box; color: #25af61; font-size: 19px; font-weight: bold; text-decoration: none; " target="_blank">Welcome to Eastwest Warehouse</a>
      </td>
      </tr>
      <tr>
      <td width="100%" cellpadding="0" cellspacing="0" style=" font-family: Avenir, Helvetica, sans-serif; box-sizing: border-box; background-color: #ffffff; border-bottom: 1px solid #edeff2; border-top: 1px solid #edeff2; margin: 0; padding: 0; width: 100%; ">
      <table align="center" width="570" cellpadding="0" cellspacing="0" style=" font-family: Avenir, Helvetica, sans-serif; box-sizing: border-box; background-color: #ffffff; margin: 0 auto; padding: 0; width: 570px; ">
      <tbody>
      <tr>
      <td style=" font-family: Avenir, Helvetica, sans-serif; box-sizing: border-box; padding: 35px; ">
      <p style=" font-family: Avenir, Helvetica, sans-serif; box-sizing: border-box; color: #74787e; font-size: 16px; line-height: 1.5em; margin-top: 0; text-align: left; font-weight:bold">Hi, <span style="text-transform: capitalize;"> ` +
    name +
    `</span></p>
      <p style=" font-family: Avenir, Helvetica, sans-serif; box-sizing: border-box; color: #74787e; font-size: 16px; line-height: 1.5em; margin-top: 0; text-align: left; ">You have requested to reset your password.</p>
      <p style=" font-family: Avenir, Helvetica, sans-serif; box-sizing: border-box; color: #74787e; font-size: 16px; line-height: 1.5em; margin-top: 0; text-align: left; ">Please click the button below to reset your password!</p>
      <table align="center" width="100%" cellpadding="0" cellspacing="0" style=" font-family: Avenir, Helvetica, sans-serif; box-sizing: border-box; margin: 30px auto; padding: 0; text-align: center; width: 100%; ">
      <tbody>
      <tr>
      <td align="center" style=" font-family: Avenir, Helvetica, sans-serif; box-sizing: border-box; ">
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style=" font-family: Avenir, Helvetica, sans-serif; box-sizing: border-box; ">
      <tbody>
      <tr>
      <td align="center" style=" font-family: Avenir, Helvetica, sans-serif; box-sizing: border-box; ">
      <table border="0" cellpadding="0" cellspacing="0" style=" font-family: Avenir, Helvetica, sans-serif; box-sizing: border-box; ">
      <tbody>
      <tr>
      <td style=" font-family: Avenir, Helvetica, sans-serif; box-sizing: border-box; "> <a href="` +
    config.uiUrl +
    `/reset-password/` +
    token +
    `" style=" font-family: Avenir, Helvetica, sans-serif; box-sizing: border-box; border-radius: 3px; color: #fff; display: inline-block; text-decoration: none; background-color: #2ab27b; border-top: 10px solid #2ab27b; border-right: 18px solid #2ab27b; border-bottom: 10px solid #2ab27b; border-left: 18px solid #2ab27b; " target="_blank"> Reset Your Password </a>
      </td>
      </tr>
      </tbody>
      </table>
      </td>
      </tr>
      </tbody>
      </table>
      </td>
      </tr>
      </tbody>
      </table>
      <p style=" font-family: Avenir, Helvetica, sans-serif; box-sizing: border-box; color: #74787e; font-size: 16px; line-height: 1.5em; margin-top: 0; text-align: left; ">Keep Creating,
      <br />The Eastwest Warehouse Team</p>
      </td>
      </tr>
      </tbody>
      </table>
      </td>
      </tr>
      <tr>
      <td style=" font-family: Avenir, Helvetica, sans-serif; box-sizing: border-box; ">
      <table align="center" width="570" cellpadding="0" cellspacing="0" style=" font-family: Avenir, Helvetica, sans-serif; box-sizing: border-box; margin: 0 auto; padding: 0; text-align: center; width: 570px; ">
      <tbody>
      <tr>
      <td align="center" style=" font-family: Avenir, Helvetica, sans-serif; box-sizing: border-box; padding: 35px; ">
      <p style=" font-family: Avenir, Helvetica, sans-serif; box-sizing: border-box; line-height: 1.5em; margin-top: 0; color: #aeaeae; font-size: 12px; text-align: center; ">© 2022 Eastwest Warehouse. All rights reserved.</p>
      </td>
      </tr>
      </tbody>
      </table>
      </td>
      </tr>
      </tbody>
      </table>
      </td>
      </tr>
      </tbody>
      </table>
      </div>
    `;
  const info = transporter.sendMail({
    from: "Eastwest Warehouse Team", // sender address
    to: email, // list of receivers
    subject: "Reset Password Request", // Subject line
    html, // html body
  });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const email = req.body.email;

  userRepo
    .findOneUserByEmail(email)
    .then(
      async (cEmail) => {
        if (cEmail) {
          const tokenRP = await common.encryptPassword("resetPassword");
          const token = tokenRP
            .substring(21, tokenRP.length)
            .replace(/\//g, "");
          console.log(token);

          userRepo
            .updateResetPasswordToken(email, token)
            .then(
              (reset) => {
                emailResetPasword(cEmail.email, token, cEmail.name);
                res.status(200).send({ status: "success" });
              },
              (reason) => {
                res.status(500);
                res.json(reason);
              }
            )
            .catch((err) => {
              res.status(400).send(err);
            });
        } else {
          res.status(200).send({ status: "success" });
        }
      },
      (reason) => {
        res.status(500);
        res.json(reason);
      }
    )
    .catch((err) => {
      res.status(400).send(err);
    });
};

export const newPassword = async (req: Request, res: Response) => {
  const token = req.body.token;
  const password = req.body.newPassword;
  userRepo
    .findByResetToken(token)
    .then(
      (user) => {
        userRepo
          .updatePassword(token, password)
          .then(
            (uPass) => {
              userRepo
                .updateTokenById(user.id)
                .then(
                  (uToken) => {
                    res.status(200).send({ status: "success" });
                  },
                  (reason) => {
                    res.status(500);
                    res.json(reason);
                  }
                )
                .catch((err) => {
                  res.status(400).send(err);
                });
            },
            (reason) => {
              res.status(500);
              res.json(reason);
            }
          )
          .catch((err) => {
            res.status(400).send(err);
          });
      },
      (reason) => {
        res.status(500);
        res.json(reason);
      }
    )
    .catch((err) => {
      res.status(400).send(err);
    });
};

export const uploadImage = async (req, res) => {
  try {
    const img = req.file.filename;

    const host = "user/getFile/";
    const url = host.concat(img);

    const userId = req.body.user._id;

    const dataAvatar = { originalName: img, filePath: url };
    const result = await userRepo.updateAvatar(url, userId);

    if (result) {
      res.status(200).send({ status: "success", data: url });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getFile = (req: Request, res: Response) => {
  const url = path.join(__dirname, "../assets/upload", req.params.url);
  res.sendFile(url);
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.body.user._id;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    const checkUserId = await userRepo.findUserByIdAfterLogin(userId);

    if (await common.comparePassword(checkUserId.password, oldPassword)) {
      const changePas = await userRepo.changePasswordById(userId, newPassword);

      res.status(200).send({ status: "success" });
    } else {
      res.status(400).json({
        status: "failed",
        message: "Wrong Old Password!",
      });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const changeEmail = async (req: Request, res: Response) => {
  try {
    const userId = req.body.user._id;
    const password = req.body.password;
    const email = req.body.email;

    const checkUser = await userRepo.findUserByIdAfterLogin(userId);

    if (checkUser) {
      if (!common.comparePassword(checkUser.password, password)) {
        res.status(400).json({ status: "Wrong Password!" });
      } else {
        userRepo
          .countEmail(email)
          .then(
            (email) => {
              if (email > 0) {
                res.status(400);
                res.json({ status: "Email already registered" });
              } else {
                userRepo
                  .changeEmail(userId, email)
                  .then(
                    (user) => {
                      res.json({ status: "success" });
                    },
                    (reason) => {
                      res.status(500);
                      res.json(reason);
                    }
                  )
                  .catch((err) => {
                    res.status(400).send(err);
                  });
              }
            },
            (reason) => {
              res.status(500);
              res.json(reason);
            }
          )
          .catch((err) => {
            res.status(400).send(err);
          });
      }
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const confirmPassword = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const userId = req.body.user._id;

    if (password !== confirmPassword) {
      res.status(400).send({ status: "Password is invalid" });
    } else {
      const changePas = await userRepo.updateProfileUser(
        userId,
        password,
        email
      );
      res.status(200).send({ status: "success" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.body.user._id;

    const getId = await userRepo.findById(userId);

    if (getId) {
      res.status(200).send({ status: "success", data: getId });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const editWorker = async (req: Request, res: Response) => {
  try {
    const userId = req.body.user._id;
    const workerId = req.body.workerId;

    await worker_managerment.update(
      { ...req.body },
      { where: { id: workerId } }
    );

    console.log("vao day");

    const updateUr: worker_managerment | null =
      await worker_managerment.findByPk(workerId);
    if (updateUr) {
      res.status(200).send({ status: "success", data: updateUr });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};
