import Sequelize, { DataTypes, Model, Optional } from "sequelize";

export interface location_managermenrtAttributes {
  id: number;
  Loc_Barcodes?: string;
  Position?: string;
  created_at: Date;
  updated_at: Date;
  limit_size?: number;
}

export type location_managermenrtPk = "id";
export type location_managermenrtId =
  location_managermenrt[location_managermenrtPk];
export type location_managermenrtCreationAttributes = Optional<
  location_managermenrtAttributes,
  location_managermenrtPk
>;

export class location_managermenrt
  extends Model<
    location_managermenrtAttributes,
    location_managermenrtCreationAttributes
  >
  implements location_managermenrtAttributes
{
  id: number;
  Loc_Barcodes?: string;
  Position?: string;
  created_at: Date;
  updated_at: Date;
  limit_size?: number;

  static initModel(
    sequelize: Sequelize.Sequelize
  ): typeof location_managermenrt {
    location_managermenrt.init(
      {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        Loc_Barcodes: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        Position: {
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
        limit_size: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "location_managermenrt",
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
    return location_managermenrt;
  }
}
