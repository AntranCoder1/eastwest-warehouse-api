import Sequelize, { DataTypes, Model, Optional } from "sequelize";

export interface inventory_countAttributes {
  id: number;
  SKU?: string;
  QBQty?: number;
  Qty_from_app?: number;
  Counted_Qty?: number;
  created_at: Date;
  updated_at: Date;
  workListId?: number;
  active: number;
}

export type inventory_countPk = "id";
export type inventory_countId = inventory_count[inventory_countPk];
export type inventory_countCreationAttributes = Optional<
  inventory_countAttributes,
  inventory_countPk
>;

export class inventory_count
  extends Model<inventory_countAttributes, inventory_countCreationAttributes>
  implements inventory_countAttributes
{
  id: number;
  SKU?: string;
  QBQty?: number;
  Qty_from_app?: number;
  Counted_Qty?: number;
  created_at: Date;
  updated_at: Date;
  workListId?: number;
  active: number;

  static initModel(sequelize: Sequelize.Sequelize): typeof inventory_count {
    inventory_count.init(
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
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        workListId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "work_list",
            key: "id",
          },
        },
        active: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "inventory_count",
        timestamps: false,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "id" }],
          },
          {
            name: "IDX_inventCountWorkListId",
            using: "BTREE",
            fields: [{ name: "workListId" }],
          },
        ],
      }
    );
    return inventory_count;
  }
}
