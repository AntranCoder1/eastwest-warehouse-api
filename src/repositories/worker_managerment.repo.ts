import { worker_managerment } from "../models/worker_managerment.model";
import * as common from "../utils/common.util";
import sequelize, { Op, where } from "sequelize";

export const createWorker = async (data) => {
  const created = new Date();
  const updated = new Date();

  const encryptedInfo = await common.encryptPassword(data.password);

  const workerProfile = new worker_managerment({
    name: data.name,
    email: data.email,
    phone: data.phone,
    password: encryptedInfo,
    created_at: created,
    updated_at: updated,
    isInvite: 0,
    username: data.username,
    status: 0,
    delete_status: 0,
  });
  return workerProfile.save();
};

export const getAll = () => {
  return worker_managerment.findAll({
    where: {
      delete_status: 0,
    },
    attributes: [
      "id",
      "name",
      "email",
      "phone",
      "created_at",
      "updated_at",
      "reset_password_token",
      "last_login",
      "last_active",
      "isInvite",
      "username",
      "status",
      "delete_status",
      "image",
    ],
  });
};

export const getAllUserRemove = () => {
  return worker_managerment.findAll({
    where: {
      delete_status: 1,
    },
  });
};

export const getById = (workerId: number) => {
  return worker_managerment.findOne({
    where: {
      id: workerId,
    },
  });
};

export const seachName = (name) => {
  console.log("name", name);

  let query = {};
  if (name !== "") {
    query = {
      [Op.or]: [
        {
          name: {
            [Op.substring]: name,
          },
        },
        {
          username: {
            [Op.substring]: name,
          },
        },
        {
          email: {
            [Op.substring]: name,
          },
        },
      ],
    };
  }
  return worker_managerment.findAll({
    where: query,
  });
};

export const deleteWorker = (workerId) => {
  // return worker_managerment.destroy({ where: { id: workerId } });
  return worker_managerment.update(
    { delete_status: 1 },
    { where: { id: workerId } }
  );
};

export const removeDeleteWorker = (workerId) => {
  // return worker_managerment.destroy({ where: { id: workerId } });
  return worker_managerment.update(
    { delete_status: 0 },
    { where: { id: workerId } }
  );
};

export const importWorker = async (parsedData) => {
  const created = new Date();
  const updated = new Date();

  const workerArr = [];

  for (const i of parsedData) {
    const password = i.password;
    const encryptedInfo = await common.encryptPassword(password.toString());

    const newWorker = {
      name: i.name,
      email: i.email,
      phone: i.phone,
      password: encryptedInfo,
      created_at: created,
      updated_at: updated,
    };

    workerArr.push(newWorker);
  }

  return worker_managerment.bulkCreate(workerArr);
};

export const getIdUser = (name) => {
  return worker_managerment.findOne({
    where: {
      name: name,
    },
  });
};

export const findOneUserByEmail = (email) => {
  return worker_managerment.findOne({ where: { email } });
};

export const findOneUserByUsername = (username) => {
  return worker_managerment.findOne({ where: { username } });
};

export let updateLastLogin = (userId) => {
  const lastLogin = new Date();
  return worker_managerment.update(
    { last_login: lastLogin },
    { where: { id: userId } }
  );
};

export const logout = (userId) => {
  const lastActive = new Date();
  return worker_managerment.update(
    { last_active: lastActive },
    { where: { id: userId } }
  );
};

export const logoutToken = (userId) => {
  return worker_managerment.update({ token: "" }, { where: { id: userId } });
};

export let updateActive = (userId) => {
  const lastLogin = new Date();
  return worker_managerment.update(
    { last_login: lastLogin, status: 1 },
    { where: { id: userId } }
  );
};

export const getWorkerWithUsername = (name) => {
  return worker_managerment.findOne({
    where: {
      username: name,
    },
  });
};

export const getWorkerWithEmail = (name) => {
  return worker_managerment.findOne({
    where: {
      email: name,
    },
  });
};

export const findUserByIdAfterLogin = (id: string) => {
  return worker_managerment.findOne({ where: { id } });
};

export const changePasswordById = async (email: string, newPassword: any) => {
  const encryptedInfo = await common.encryptPassword(newPassword);
  const password = encryptedInfo;
  return worker_managerment.update({ password }, { where: { email: email } });
};

export const updateResetPasswordToken = (email, token, verify) => {
  return worker_managerment.update(
    { reset_password_token: token, verify: verify },
    { where: { email } }
  );
};

export const findByResetToken = (token) => {
  return worker_managerment.findOne({
    attributes: ["id"],
    where: { reset_password_token: token },
  });
};

export const updatePassword = async (token, newpassword) => {
  const encryptedInfo = await common.encryptPassword(newpassword);
  const password = encryptedInfo.toString();
  return worker_managerment.update(
    { password },
    { where: { reset_password_token: token } }
  );
};

export const updateTokenById = (id) => {
  return worker_managerment.update(
    { reset_password_token: "", verify: 0 },
    { where: { id } }
  );
};

export const updateProfileUser = async (
  id: string,
  newPassword: any,
  email: any
) => {
  const encryptedInfo = await common.encryptPassword(newPassword);
  const password = encryptedInfo;
  return worker_managerment.update({ email, password }, { where: { id } });
};

export const findById = (userId) => {
  return worker_managerment.findOne({
    where: {
      id: userId,
    },
    attributes: [
      "name",
      "email",
      "phone",
      "created_at",
      "updated_at",
      "reset_password_token",
      "last_login",
      "last_active",
      "isInvite",
      "username",
      "status",
      "delete_status",
      "image",
      "token",
    ],
  });
};

// export const editImage = (image) => {
//   const updated = new Date();

//   return worker_managerment.update({ image: image }, { where: {} });
// };

export const updateInvite = (workerId, isInvite) => {
  return worker_managerment.update(
    { isInvite: isInvite },
    { where: { id: workerId } }
  );
};

export let updateToken = (userId, token) => {
  return worker_managerment.update({ token: token }, { where: { id: userId } });
};

export let updateTokenWorker = (token, userId) => {
  return worker_managerment.update(
    { reset_password_token: token },
    { where: { id: userId } }
  );
};

export let checkVerifyEmail = (email, verify) => {
  return worker_managerment.findOne({
    where: { email: email, verify: verify },
  });
};
