import Sequelize, { DataTypes, Model, Optional } from "sequelize";

export interface product_managerment_imageAttributes {
  id: number;
  image?: string;
  product_managerment_id?: number;
  created_at: Date;
  updated_at: Date;
}

export type product_managerment_imagePk = "id";
export type product_managerment_imageId =
  product_managerment_image[product_managerment_imagePk];
export type product_managerment_imageCreationAttributes = Optional<
  product_managerment_imageAttributes,
  product_managerment_imagePk
>;

export class product_managerment_image
  extends Model<
    product_managerment_imageAttributes,
    product_managerment_imageCreationAttributes
  >
  implements product_managerment_imageAttributes
{
  id!: number;
  image?: string;
  product_managerment_id?: number;
  created_at!: Date;
  updated_at!: Date;

  static initModel(
    sequelize: Sequelize.Sequelize
  ): typeof product_managerment_image {
    product_managerment_image.init(
      {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        image: {
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
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "product_managerment_image",
        timestamps: false,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "id" }],
          },
          {
            name: "IDX_productManagerMentId",
            using: "BTREE",
            fields: [{ name: "product_managerment_id" }],
          },
        ],
      }
    );
    return product_managerment_image;
  }
}
