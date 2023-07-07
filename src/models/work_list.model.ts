import Sequelize, { DataTypes, Model, Optional } from "sequelize";

export interface work_listAttributes {
  id: number;
  Type?: string;
  Date?: Date;
  Status?: string;
  created_at: Date;
  updated_at: Date;
  worker_managerment_id?: number;
  Container_Number?: string;
  SKU_pickingLTL?: string;
  Quantity_pickingLTL?: number;
  picking_type?: string;
  user?: number;
  Title_invent?: string;
  desc_invent?: string;
  workListPickingltlId?: number;
  statusLTL?: string;
}

export type work_listPk = "id";
export type work_listId = work_list[work_listPk];
export type work_listCreationAttributes = Optional<
  work_listAttributes,
  work_listPk
>;

export class work_list
  extends Model<work_listAttributes, work_listCreationAttributes>
  implements work_listAttributes
{
  id!: number;
  Type?: string;
  Date?: Date;
  Status?: string;
  created_at!: Date;
  updated_at!: Date;
  worker_managerment_id?: number;
  Container_Number?: string;
  SKU_pickingLTL?: string;
  Quantity_pickingLTL?: number;
  picking_type?: string;
  user?: number;
  Title_invent?: string;
  desc_invent?: string;
  workListPickingltlId?: number;
  statusLTL?: string;

  static initModel(sequelize: Sequelize.Sequelize): typeof work_list {
    work_list.init(
      {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        Type: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        Date: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        Status: {
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
        worker_managerment_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "users",
            key: "id",
          },
        },
        Container_Number: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        SKU_pickingLTL: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        Quantity_pickingLTL: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        picking_type: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        user: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "worker_managerment",
            key: "id",
          },
        },
        Title_invent: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        desc_invent: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        workListPickingltlId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "work_list_pickingltl",
            key: "id",
          },
        },
        statusLTL: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "work_list",
        timestamps: false,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "id" }],
          },
          {
            name: "IDX_workerManagermentId",
            using: "BTREE",
            fields: [{ name: "worker_managerment_id" }],
          },
          {
            name: "IDX_userId",
            using: "BTREE",
            fields: [{ name: "users" }],
          },
          {
            name: "IDX_workListPickingLtlId",
            using: "BTREE",
            fields: [{ name: "workListPickingltlId" }],
          },
        ],
      }
    );
    return work_list;
  }
}
