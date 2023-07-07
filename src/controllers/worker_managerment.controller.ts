import { Request, Response } from "express";
import { initModels } from "../models/init-models";
import fs from "fs";
import path from "path";
import config from "../config/db.config";
import { sequelize } from "../models/index";
import * as common from "../utils/common.util";
import * as jwtUtil from "../utils/jwt.util";
import xlsx from "xlsx";
import * as worker_managermentRepo from "../repositories/worker_managerment.repo";
import { worker_managerment } from "../models/worker_managerment.model";
import * as activeRepo from "../repositories/active.repo";
import nodemailer from "nodemailer";

initModels(sequelize);

export const createNewWorker = async (req: Request, res: Response) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const username = req.body.username;

    if (password !== confirmPassword) {
      res
        .status(400)
        .json({ status: "failed", message: "Password is invalid" });
    } else {
      const dataWorker = {
        name,
        email,
        phone,
        password,
        username,
      };

      const create = await worker_managermentRepo.createWorker(dataWorker);

      if (create) {
        res.status(200).send({ status: "success", data: create });
      } else {
        res.status(400).send({ status: "failed" });
      }
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const showListWorker = async (req: Request, res: Response) => {
  try {
    const workers = await worker_managermentRepo.getAll();

    if (workers) {
      res.status(200).send({ status: "success", data: workers });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const workerManagermentId = async (req: Request, res: Response) => {
  try {
    const workerId = req.body.workerId;

    const worker = await worker_managermentRepo.getById(workerId);

    if (worker) {
      res.status(200).send({ status: "success", data: worker });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const editWorker = async (req: Request, res: Response) => {
  try {
    const workerId = req.body.user._id;
    await worker_managerment.update(
      { ...req.body },
      { where: { id: workerId } }
    );

    console.log("vao day");

    const findUserId = await worker_managermentRepo.findById(workerId);

    if (findUserId.isInvite) {
      const logoutToken = await worker_managermentRepo.logoutToken(workerId);
    }

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

export const searchByName = async (req: Request, res: Response) => {
  try {
    const name = req.body.name;

    if (name === "") {
      const workers = await worker_managermentRepo.getAll();

      if (workers) {
        res.status(200).send({ status: "success", data: workers });
      } else {
        res.status(400).send({ status: "failed" });
      }
    } else {
      const search = await worker_managermentRepo.seachName(name);

      if (search) {
        res.status(200).send({ status: "success", data: search });
      } else {
        res.status(400).send({ status: "failed" });
      }
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteWorker = async (req: Request, res: Response) => {
  try {
    const workerId = req.body.workerId;

    const remove = await worker_managermentRepo.deleteWorker(workerId);

    if (remove) {
      res.status(200).send({ status: "success" });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const RemoveDeleteWorker = async (req: Request, res: Response) => {
  try {
    const workerId = req.body.workerId;

    const remove = await worker_managermentRepo.removeDeleteWorker(workerId);

    if (remove) {
      res.status(200).send({ status: "success" });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const uploadFile = (req, res) => {
  try {
    const file = req.file.filename;

    const host = "workerManagerment/getFile/";
    const url = host.concat(file);

    const dataAvatar = { originalName: file, filePath: url };

    // const updateUserImage = await worker_managermentRepo.getById;

    if (dataAvatar) {
      res.status(200).send({ status: "success", data: dataAvatar });
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

export const importFile = (req, res) => {
  try {
    const files = req.file.filename;

    const host = "workerManagerment/getFile/";
    const urls = host.concat(files);

    const dataAvatar = { originalName: files, filePath: urls };

    const url = path.join(
      __dirname,
      `../assets/upload/${dataAvatar.originalName}`
    );

    const file = xlsx.readFile(url);

    const sheetNames = file.SheetNames;
    const totalSheets = sheetNames.length;

    let parsedData = [];

    for (let i = 0; i < totalSheets; i++) {
      const tempData = xlsx.utils.sheet_to_json(file.Sheets[sheetNames[i]]);
      parsedData.push(...tempData);
    }

    if (parsedData.length > 0) {
      const addImportFile = worker_managermentRepo.importWorker(parsedData);

      return res.status(200).send({ status: "success" });
    } else {
      return res
        .status(200)
        .send({ status: "success", message: "no data added" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    // const email = req.body.email;
    const password = req.body.password;
    const username = req.body.username;

    const checkWorkerUsername =
      await worker_managermentRepo.getWorkerWithUsername(username);

    const checkWorkerEmail = await worker_managermentRepo.getWorkerWithEmail(
      username
    );

    // login with username

    if (checkWorkerUsername) {
      if (!username || !password) {
        return res.status(400).send({
          status: "falied",
          message: "Please enter full information!!!",
        });
      }

      const checkUsername = await worker_managermentRepo.findOneUserByUsername(
        username
      );

      if (checkUsername) {
        if (checkUsername !== null) {
          if (await common.comparePassword(checkUsername.password, password)) {
            const token = jwtUtil.sign({
              username: checkUsername.name,
              _id: checkUsername.id,
              date: new Date(),
            });
            activeRepo.ceateActiveLogin(checkUsername.id);

            worker_managermentRepo
              .updateLastLogin(checkUsername.id)
              .then((lastLogin) => {
                return res.json({ token });
              });

            worker_managermentRepo.updateActive(checkUsername.id);

            worker_managermentRepo.updateToken(checkUsername.id, token);
          } else {
            return res.status(400).json({
              status: "failed",
              mesage:
                "User has not been validated. Please check your email and password your account!",
            });
          }
        } else {
          return res.status(400).json({
            status: "verify",
            mesage:
              "User has not been validated. Please check your email and password your account!",
          });
        }
      } else {
        return res.status(400).json({
          status: "failed",
          mesage:
            "User has not been validated. Please check your email and password your account!",
        });
      }
    }

    // login with email

    if (checkWorkerEmail) {
      if (!username || !password) {
        return res.status(400).send({
          status: "falied",
          message: "Please enter full information!!!",
        });
      }

      const checkEmail = await worker_managermentRepo.findOneUserByEmail(
        username
      );

      if (checkEmail) {
        if (checkEmail !== null) {
          if (await common.comparePassword(checkEmail.password, password)) {
            const token = jwtUtil.sign({
              username: checkEmail.name,
              _id: checkEmail.id,
              date: new Date(),
            });
            activeRepo.ceateActiveLogin(checkEmail.id);

            worker_managermentRepo
              .updateLastLogin(checkEmail.id)
              .then((lastLogin) => {
                return res.json({ token });
              });

            worker_managermentRepo.updateActive(checkEmail.id);

            worker_managermentRepo.updateToken(checkEmail.id, token);
          } else {
            return res.status(400).json({
              status: "failed",
              mesage:
                "User has not been validated. Please check your email and password your account!",
            });
          }
        } else {
          return res.status(400).json({
            status: "verify",
            mesage:
              "User has not been validated. Please check your email and password your account!",
          });
        }
      } else {
        return res.status(400).json({
          status: "failed",
          mesage:
            "User has not been validated. Please check your email and password your account!",
        });
      }
    }

    // check not exit
    if (!checkWorkerUsername && !checkWorkerEmail) {
      return res.status(400).json({
        status: "failed",
        mesage:
          "User has not been validated. Please check your email and password your account!",
      });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const userId = req.body.user._id;

    activeRepo.createActiveLogout(userId);

    const logoutToken = await worker_managermentRepo.logoutToken(userId);

    if (logoutToken) {
      res.status(200).send({ status: "success" });
    } else {
      res.status(400).send({ status: "failed" });
    }

    // worker_managermentRepo
    //   .logoutToken(userId)
    //   .then(
    //     (uLogout) => {
    //       res.status(200);
    //       res.json({ status: "success" });
    //     },
    //     (reason) => {
    //       res.status(500);
    //       res.json(reason);
    //     }
    //   )
    //   .catch((error) => {
    //     console.log(error);
    //   });

    // worker_managermentRepo
    //   .logout(userId)
    //   .then(
    //     (uLogout) => {
    //       res.status(200);
    //       res.json({ status: "success" });
    //     },
    //     (reason) => {
    //       res.status(500);
    //       res.json(reason);
    //     }
    //   )
    //   .catch((error) => {
    //     console.log(error);
    //   });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getUserRemove = async (req: Request, res: Response) => {
  try {
    const getAll = await worker_managermentRepo.getAllUserRemove();

    if (getAll) {
      res.status(200).send({ status: "success", data: getAll });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.body.user._id;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const email = req.body.email;

    const checkUserId = await worker_managermentRepo.getWorkerWithEmail(email);

    if (await common.comparePassword(checkUserId.password, oldPassword)) {
      const changePas = await worker_managermentRepo.changePasswordById(
        email,
        newPassword
      );

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

const emailResetPasword = async (email, token, name, r) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "h2testsendmail@gmail.com", // generated ethereal user
      pass: "oloxipvqqemuecwi", // generated ethereal password
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
    <p style=" font-family: Avenir, Helvetica, sans-serif; box-sizing: border-box; color: #74787e; font-size: 16px; line-height: 1.5em; margin-top: 0; text-align: left; font-weight:bold">Verify Code, <span style="text-transform: capitalize;"> ` +
    r +
    `</span></p>
      <p style=" font-family: Avenir, Helvetica, sans-serif; box-sizing: border-box; color: #74787e; font-size: 16px; line-height: 1.5em; margin-top: 0; text-align: left; ">You have requested to reset your password.</p>
      
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
  const info = await transporter.sendMail({
    from: "Eastwest Warehouse Team", // sender address
    to: email, // list of receivers
    subject: "Reset Password Request", // Subject line
    html, // html body
  });

  if (info.response) {
    return true;
  } else {
    return false;
  }
};

const random = (length) => {
  let result = "";
  const characters = "0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const forgotPassword = async (req: Request, res: Response) => {
  const email = req.body.email;

  if (!email) {
    return res.status(404).send({ status: "failed" });
  }

  worker_managermentRepo
    .findOneUserByEmail(email)
    .then(
      async (cEmail) => {
        if (cEmail) {
          let r = random(6);

          // const encryptedInfo = await common.encryptPassword(r);

          // const updatePassword = await worker_managermentRepo.updateTokenWorker(
          //   encryptedInfo,
          //   cEmail.id
          // );

          const tokenRP = await common.encryptPassword(r);
          const token = tokenRP
            .substring(21, tokenRP.length)
            .replace(/\//g, "");

          const verify = r;

          worker_managermentRepo
            .updateResetPasswordToken(email, token, verify)
            .then(
              async (reset) => {
                const result = await emailResetPasword(
                  cEmail.email,
                  token,
                  cEmail.name,
                  r
                );
                if (result) {
                  res.status(200).send({ status: "success" });
                } else {
                  res.status(400).send({ status: "failed" });
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
  worker_managermentRepo
    .findByResetToken(token)
    .then(
      (user) => {
        worker_managermentRepo
          .updatePassword(token, password)
          .then(
            (uPass) => {
              worker_managermentRepo
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

export const confirmPassword = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const userId = req.body.user._id;

    if (password !== confirmPassword) {
      res.status(400).send({ status: "Password is invalid" });
    } else {
      const changePas = await worker_managermentRepo.updateProfileUser(
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

    const getId = await worker_managermentRepo.findById(userId);

    if (getId) {
      res.status(200).send({ status: "success", data: getId });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const checkVerify = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const verify = req.body.verify;

    const user = await worker_managermentRepo.checkVerifyEmail(
      email,
      Number(verify)
    );

    if (user) {
      res
        .status(200)
        .send({ status: "success", data: user.reset_password_token });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};
