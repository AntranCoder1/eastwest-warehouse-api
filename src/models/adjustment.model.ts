import Sequelize, { DataTypes, Model, Optional } from "sequelize";

export interface adjustmentAttributes {
  id: number;
  SKU?: string;
  Location?: string;
  current_quantity?: number;
  quantity_update?: number;
  created_at: Date;
  updated_at: Date;
}

export type adjustmentPk = "id";
export type adjustmentId = adjustment[adjustmentPk];
export type adjustmentCreationAttributes = Optional<
  adjustmentAttributes,
  adjustmentPk
>;

export class adjustment
  extends Model<adjustmentAttributes, adjustmentCreationAttributes>
  implements adjustmentAttributes
{
  id: number;
  SKU?: string;
  Location?: string;
  current_quantity?: number;
  quantity_update?: number;
  created_at: Date;
  updated_at: Date;

  static initModel(sequelize: Sequelize.Sequelize): typeof adjustment {
    adjustment.init(
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
        Location: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        current_quantity: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        quantity_update: {
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
      },
      {
        sequelize,
        tableName: "adjustment",
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
    return adjustment;
  }
}
