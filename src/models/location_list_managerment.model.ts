import Sequelize, { DataTypes, Model, Optional } from "sequelize";

export interface location_list_managermentAttributes {
  id: number;
  SKU?: string;
  Quantity?: number;
  location_managerment_id?: number;
  created_at: Date;
  updated_at: Date;
  Loc_Barcode?: string;
  product_managerment_id?: number;
  UPC?: string;
}

export type location_list_managermentPk = "id";
export type location_list_managermentId =
  location_list_managerment[location_list_managermentPk];
export type location_list_managermentCreationAttributes = Optional<
  location_list_managermentAttributes,
  location_list_managermentPk
>;

export class location_list_managerment
  extends Model<
    location_list_managermentAttributes,
    location_list_managermentCreationAttributes
  >
  implements location_list_managermentAttributes
{
  id: number;
  SKU?: string;
  Quantity?: number;
  location_managerment_id?: number;
  created_at: Date;
  updated_at: Date;
  Loc_Barcode?: string;
  product_managerment_id?: number;
  UPC?: string;

  static initModel(
    sequelize: Sequelize.Sequelize
  ): typeof location_list_managerment {
    location_list_managerment.init(
      {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        SKU: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        Quantity: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        location_managerment_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "location_managermenrt",
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
        Loc_Barcode: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        product_managerment_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "product_managerment",
            key: "id",
          },
        },
        UPC: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "location_list_managerment",
        timestamps: false,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "id" }],
          },
          {
            name: "IDX_locationManagerId",
            using: "BTREE",
            fields: [{ name: "location_managerment_id" }],
          },
          {
            name: "IDX_productManagerId",
            using: "BTREE",
            fields: [{ name: "product_managerment_id" }],
          },
        ],
      }
    );
    return location_list_managerment;
  }
}
