import Sequelize, { DataTypes, Model, Optional } from "sequelize";

export interface usersAttributes {
  id: number;
  name?: string;
  email?: string;
  phone?: number;
  password?: string;
  profile_image?: string;
  created_at: Date;
  updated_at: Date;
  isAdmin: number;
  isInvite: number;
  last_login?: Date;
  last_active?: Date;
  reset_password_token?: string;
}

export type usersPk = "id";
export type usersId = users[usersPk];
export type usersCreationAttributes = Optional<usersAttributes, usersPk>;

export class users
  extends Model<usersAttributes, usersCreationAttributes>
  implements usersAttributes
{
  id!: number;
  name?: string;
  email?: string;
  phone?: number;
  password?: string;
  profile_image?: string;
  created_at!: Date;
  updated_at!: Date;
  isAdmin: number;
  isInvite: number;
  last_login!: Date;
  last_active!: Date;
  reset_password_token?: string;

  static initModel(sequelize: Sequelize.Sequelize): typeof users {
    users.init(
      {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        phone: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        profile_image: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        isAdmin: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        isInvite: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        last_login: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        last_active: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        reset_password_token: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "users",
        timestamps: false,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "id" }],
          },
        ],
      }
    );
    return users;
  }
}
