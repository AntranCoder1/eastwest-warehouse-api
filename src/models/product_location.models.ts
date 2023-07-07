import Sequelize, { DataTypes, Model, Optional } from "sequelize";

export interface product_locationAttributes {
  id: number;
  SKU_product?: string;
  Loc_Barcodes?: string;
  Quantity?: number;
  Position?: string;
  product_transfer_id?: number;
  Quantity_Transfer?: number;
  transfer_id?: number;
  created_at?: Date;
  updated_at?: Date;
  UPC?: string;
  product_managerment_id?: number;
  product_name?: string;
  location_managerment_id?: number;
  product_location_type?: string;
  status?: string;
}

export type product_locationPk = "id";
export type product_locationId = product_location[product_locationPk];
export type product_locationCreationAttributes = Optional<
  product_locationAttributes,
  product_locationPk
>;

export class product_location
  extends Model<product_locationAttributes, product_locationCreationAttributes>
  implements product_locationAttributes
{
  id: number;
  SKU_product?: string;
  Loc_Barcodes?: string;
  Quantity?: number;
  Position?: string;
  product_transfer_id?: number;
  Quantity_Transfer?: number;
  transfer_id?: number;
  created_at?: Date;
  updated_at?: Date;
  UPC?: string;
  product_managerment_id?: number;
  product_name?: string;
  location_managerment_id?: number;
  product_location_type?: string;
  status?: string;

  static initModel(sequelize: Sequelize.Sequelize): typeof product_location {
    product_location.init(
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
        Loc_Barcodes: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        Quantity: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        Position: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        product_transfer_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        Quantity_Transfer: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        transfer_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        UPC: {
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
        product_name: {
          type: DataTypes.STRING,
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
        product_location_type: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        status: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "product_location",
        timestamps: false,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "id" }],
          },
          {
            name: "IDX_productLocationManagermentId",
            using: "BTREE",
            fields: [{ name: "product_managerment_id" }],
          },
          {
            name: "IDX_productLocationId",
            using: "BTREE",
            fields: [{ name: "location_managerment_id" }],
          },
        ],
      }
    );
    return product_location;
  }
}
