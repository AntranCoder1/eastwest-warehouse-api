import Sequelize, { DataTypes, Model, Optional } from "sequelize";

export interface work_list_detailAttributes {
  id: number;
  work_list_id?: number;
  SKU?: string;
  Quantity?: number;
  created_at: Date;
  updated_at: Date;
  location?: string;
  Container_Number?: string;
  quantity_transfer?: number;
  status?: string;
  fromLocation?: string;
  toLocation?: string;
  QBQty?: number;
  Qty_from_app?: number;
  Counted_Qty?: number;
}

export type work_list_detailPk = "id";
export type work_list_detailId = work_list_detail[work_list_detailPk];
export type work_list_detailCreationAttributes = Optional<
  work_list_detailAttributes,
  work_list_detailPk
>;

export class work_list_detail
  extends Model<work_list_detailAttributes, work_list_detailCreationAttributes>
  implements work_list_detailAttributes
{
  id!: number;
  work_list_id?: number;
  SKU?: string;
  Quantity?: number;
  created_at!: Date;
  updated_at!: Date;
  location?: string;
  Container_Number?: string;
  quantity_transfer?: number;
  status?: string;
  fromLocation?: string;
  toLocation?: string;
  QBQty?: number;
  Qty_from_app?: number;
  Counted_Qty?: number;

  static initModel(sequelize: Sequelize.Sequelize): typeof work_list_detail {
    work_list_detail.init(
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
        location: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        Container_Number: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        quantity_transfer: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        status: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: "working",
        },
        fromLocation: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        toLocation: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        QBQty: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        Qty_from_app: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        Counted_Qty: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "work_list_detail",
        timestamps: false,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "id" }],
          },
          {
            name: "IDX_workListId",
            using: "BTREE",
            fields: [{ name: "work_list_id" }],
          },
        ],
      }
    );
    return work_list_detail;
  }
}
