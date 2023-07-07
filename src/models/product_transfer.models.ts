import Sequelize, { DataTypes, Model, Optional } from "sequelize";

export interface product_transferAttributes {
  id: number;
  SKU_product?: string;
  Product_Name?: string;
  Quantity_Transfer?: number;
  From_Location_Barcodes?: string;
  To_Location_Barcodes?: string;
  Quantity_After_Transfer?: number;
  product_Id?: number;
  work_list_id?: number;
  created_at: Date;
  updated_at: Date;
  original_number?: number;
}

export type product_transferPk = "id";
export type product_transferId = product_transfer[product_transferPk];
export type product_transferCreationAttributes = Optional<
  product_transferAttributes,
  product_transferPk
>;

export class product_transfer
  extends Model<product_transferAttributes, product_transferCreationAttributes>
  implements product_transferAttributes
{
  id: number;
  SKU_product?: string;
  Product_Name?: string;
  Quantity_Transfer?: number;
  From_Location_Barcodes?: string;
  To_Location_Barcodes?: string;
  Quantity_After_Transfer?: number;
  product_Id?: number;
  work_list_id?: number;
  created_at: Date;
  updated_at: Date;
  original_number?: number;

  static initModel(sequelize: Sequelize.Sequelize): typeof product_transfer {
    product_transfer.init(
      {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        SKU_product: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        Product_Name: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        Quantity_Transfer: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        From_Location_Barcodes: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        To_Location_Barcodes: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        Quantity_After_Transfer: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        product_Id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "product_managerment",
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
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        original_number: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "product_transfer",
        timestamps: false,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "id" }],
          },
          {
            name: "IDX_productId",
            using: "BTREE",
            fields: [{ name: "product_Id" }],
          },
          {
            name: "IDX_workListId1",
            using: "BTREE",
            fields: [{ name: "work_list_id" }],
          },
        ],
      }
    );
    return product_transfer;
  }
}
