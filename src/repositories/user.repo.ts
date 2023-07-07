import { users } from "../models/users.model";
import * as common from "../utils/common.util";

export const findOneUserByEmail = (email) => {
  return users.findOne({ where: { email } });
};

export const registerAdmin = async (data) => {
  const created = new Date();
  const updated = new Date();

  const encryptedInfo = await common.encryptPassword(data.password);

  const userProfile = new users({
    name: data.name,
    email: data.email,
    phone: data.phone,
    password: encryptedInfo,
    profile_image: data.profile_image,
    created_at: created,
    updated_at: updated,
    isAdmin: 1,
    isInvite: 0,
  });
  return userProfile.save();
};

export let updateLastLogin = (userId) => {
  const lastLogin = new Date();
  return users.update({ last_login: lastLogin }, { where: { id: userId } });
};

export const logout = (userId) => {
  const lastActive = new Date();
  return users.update({ last_active: lastActive }, { where: { id: userId } });
};

export const updateResetPasswordToken = (email, token) => {
  return users.update({ reset_password_token: token }, { where: { email } });
};

export const findByResetToken = (token) => {
  return users.findOne({
    attributes: ["id"],
    where: { reset_password_token: token },
  });
};

export const updatePassword = async (token, newpassword) => {
  const encryptedInfo = await common.encryptPassword(newpassword);
  const password = encryptedInfo.toString();
  return users.update({ password }, { where: { reset_password_token: token } });
};

export const updateTokenById = (id) => {
  return users.update({ reset_password_token: "" }, { where: { id } });
};

export const updateAvatar = (url, userId) => {
  return users.update({ profile_image: url }, { where: { id: userId } });
};

export const findUserByIdAfterLogin = (id: string) => {
  return users.findOne({ where: { id } });
};

export const changePasswordById = async (id: string, newPassword: any) => {
  const encryptedInfo = await common.encryptPassword(newPassword);
  const password = encryptedInfo;
  return users.update({ password }, { where: { id } });
};

export const countEmail = (email) => {
  return users.count({ where: { email } });
};

export const changeEmail = (id: string, email: any) => {
  return users.update({ email }, { where: { id } });
};

export const updateProfileUser = async (
  id: string,
  newPassword: any,
  email: any
) => {
  const encryptedInfo = await common.encryptPassword(newPassword);
  const password = encryptedInfo;
  return users.update({ email, password }, { where: { id } });
};

export const findById = (userId) => {
  return users.findOne({
    where: {
      id: userId,
    },
  });
};
