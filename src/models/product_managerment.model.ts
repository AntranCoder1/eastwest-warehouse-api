import Sequelize, { DataTypes, Model, Optional } from "sequelize";

export interface product_managermentAttributes {
  id: number;
  SKU_product?: string;
  Product_Name?: string;
  Image_URL?: string;
  created_at: Date;
  updated_at: Date;
  UPC?: string;
  workListDetailId?: number;
  image_type?: string;
  isDeleted?: number;
}

export type product_managermentPk = "id";
export type product_managermentId = product_managerment[product_managermentPk];
export type product_managermentCreationAttributes = Optional<
  product_managermentAttributes,
  product_managermentPk
>;

export class product_managerment
  extends Model<
    product_managermentAttributes,
    product_managermentCreationAttributes
  >
  implements product_managermentAttributes
{
  id!: number;
  SKU_product?: string;
  Product_Name?: string;
  Image_URL?: string;
  created_at!: Date;
  updated_at!: Date;
  UPC?: string;
  workListDetailId?: number;
  image_type?: string;
  isDeleted?: number;

  static initModel(sequelize: Sequelize.Sequelize): typeof product_managerment {
    product_managerment.init(
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
        Image_URL: {
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
        UPC: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        workListDetailId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "work_list_detail",
            key: "id",
          },
        },
        image_type: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        isDeleted: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "product_managerment",
        timestamps: false,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "id" }],
          },
          {
            name: "IDX_workDetail",
            using: "BTREE",
            fields: [{ name: "workListDetailId" }],
          },
        ],
      }
    );
    return product_managerment;
  }
}
