import Sequelize, { DataTypes, Model, Optional } from "sequelize";

export interface worker_managermentAttributes {
  id: number;
  name?: string;
  email?: string;
  phone?: number;
  password?: string;
  created_at: Date;
  updated_at: Date;
  reset_password_token?: string;
  last_login?: Date;
  last_active?: Date;
  isInvite: number;
  username?: string;
  status: number;
  delete_status: number;
  image?: string;
  token?: string;
  verify?: number;
}

export type worker_managermentPk = "id";
export type worker_managermentId = worker_managerment[worker_managermentPk];
export type worker_managermentCreationAttributes = Optional<
  worker_managermentAttributes,
  worker_managermentPk
>;

export class worker_managerment
  extends Model<
    worker_managermentAttributes,
    worker_managermentCreationAttributes
  >
  implements worker_managermentAttributes
{
  id!: number;
  name?: string;
  email?: string;
  phone?: number;
  password?: string;
  created_at!: Date;
  updated_at!: Date;
  reset_password_token?: string;
  last_login?: Date;
  last_active?: Date;
  isInvite: number;
  username?: string;
  status: number;
  delete_status: number;
  image?: string;
  token?: string;
  verify?: number;

  static initModel(sequelize: Sequelize.Sequelize): typeof worker_managerment {
    worker_managerment.init(
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
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        reset_password_token: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        last_login: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        last_active: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        isInvite: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        username: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        status: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        delete_status: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        image: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        token: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        verify: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "worker_managerment",
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
    return worker_managerment;
  }
}
