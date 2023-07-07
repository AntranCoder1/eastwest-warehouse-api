import Sequelize, { DataTypes, Model, Optional } from "sequelize";

export interface activeAttributes {
  id: number;
  Date?: Date;
  Type?: string;
  Worker_id?: number;
  created_at: Date;
  updated_at: Date;
  Active?: string;
  SKU?: string;
  Quantity?: number;
  location?: string;
  from_location?: string;
  to_location?: string;
  admin_id?: number;
  counted_Qty?: number;
  work_list_detail_id?: number;
  work_list_id?: number;
}

export type activePk = "id";
export type activeId = active[activePk];
export type activeCreationAttributes = Optional<activeAttributes, activePk>;

export class active
  extends Model<activeAttributes, activeCreationAttributes>
  implements activeAttributes
{
  id: number;
  Date?: Date;
  Type?: string;
  Worker_id?: number;
  created_at: Date;
  updated_at: Date;
  Active?: string;
  SKU?: string;
  Quantity?: number;
  location?: string;
  from_location?: string;
  to_location?: string;
  admin_id?: number;
  counted_Qty?: number;
  work_list_detail_id?: number;
  work_list_id?: number;

  static initModel(sequelize: Sequelize.Sequelize): typeof active {
    active.init(
      {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        Date: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        Type: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        Worker_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "worker_managerment",
            key: "id",
          },
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        Active: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        SKU: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        Quantity: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        location: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        from_location: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        to_location: {
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
        counted_Qty: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        work_list_detail_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "work_list_detail",
            key: "id",
          },
        },
        work_list_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "work_list",
            key: "id",
          },
        },
      },
      {
        sequelize,
        tableName: "active",
        timestamps: false,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "id" }],
          },
          {
            name: "IDX_activeWorkerId",
            using: "BTREE",
            fields: [{ name: "Worker_id" }],
          },
          {
            name: "IDX_activeAdminId",
            using: "BTREE",
            fields: [{ name: "admin_id" }],
          },
          {
            name: "IDX_workListDetailId",
            using: "BTREE",
            fields: [{ name: "work_list_detail_id" }],
          },
        ],
      }
    );
    return active;
  }
}
