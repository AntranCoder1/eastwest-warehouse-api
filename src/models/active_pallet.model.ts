import Sequelize, { DataTypes, Model, Optional } from "sequelize";

export interface active_palletAttributes {
  id: number;
  pallet_number?: number;
  quantity?: number;
  active_id?: number;
  created_at: Date;
  updated_at: Date;
}

export type active_palletPk = "id";
export type active_palletId = active_pallet[active_palletPk];
export type active_palletCreationAttributes = Optional<
  active_palletAttributes,
  active_palletPk
>;

export class active_pallet
  extends Model<active_palletAttributes, active_palletCreationAttributes>
  implements active_palletAttributes
{
  id: number;
  pallet_number?: number;
  quantity?: number;
  active_id?: number;
  created_at: Date;
  updated_at: Date;

  static initModel(sequelize: Sequelize.Sequelize): typeof active_pallet {
    active_pallet.init(
      {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        pallet_number: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        quantity: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        active_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "active",
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
        tableName: "active_pallet",
        timestamps: false,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "id" }],
          },
          {
            name: "IDX_activeId",
            using: "BTREE",
            fields: [{ name: "active_id" }],
          },
        ],
      }
    );
    return active_pallet;
  }
}
