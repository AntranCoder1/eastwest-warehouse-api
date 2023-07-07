import Sequelize, { DataTypes, Model, Optional } from "sequelize";

export interface inventory_scanAttributes {
  id: number;
  work_list_id?: number;
  SKU?: string;
  location?: string;
  Quantity?: number;
  created_at: Date;
  updated_at: Date;
  userId?: number;
  status?: string;
  status_recount?: string;
  admin_id?: number;
}

export type inventory_scanPk = "id";
export type inventory_scanId = inventory_scan[inventory_scanPk];
export type inventory_scanCreationAttributes = Optional<
  inventory_scanAttributes,
  inventory_scanPk
>;

export class inventory_scan
  extends Model<inventory_scanAttributes, inventory_scanCreationAttributes>
  implements inventory_scanAttributes
{
  id: number;
  work_list_id?: number;
  SKU?: string;
  location?: string;
  Quantity?: number;
  created_at: Date;
  updated_at: Date;
  userId?: number;
  status?: string;
  status_recount?: string;
  admin_id?: number;

  static initModel(sequelize: Sequelize.Sequelize): typeof inventory_scan {
    inventory_scan.init(
      {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        work_list_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "work_list",
            key: "id",
          },
        },
        SKU: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        location: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        Quantity: {
          type: DataTypes.INTEGER,
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
        userId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "worker_managerment",
            key: "id",
          },
        },
        status: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        status_recount: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        admin_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "users",
            key: "id",
          },
        },
      },
      {
        sequelize,
        tableName: "inventory_scan",
        timestamps: false,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "id" }],
          },
          {
            name: "IDX_inventoryWorkListId",
            using: "BTREE",
            fields: [{ name: "work_list_id" }],
          },
          {
            name: "IDX_inventoryUserId",
            using: "BTREE",
            fields: [{ name: "userId" }],
          },
          {
            name: "IDX_inventoryAdminId",
            using: "BTREE",
            fields: [{ name: "admin_id" }],
          },
        ],
      }
    );
    return inventory_scan;
  }
}
