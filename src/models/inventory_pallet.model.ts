import Sequelize, { DataTypes, Model, Optional } from "sequelize";

export interface inventory_palletAttributes {
  id: number;
  pallet_number?: number;
  work_list_detail_id?: number;
  work_list_id?: number;
  quantity?: number;
  created_at?: Date;
  updated_at?: Date;
  sku?: String;
  inventory_scan_id?: number;
}

export type inventory_palletPk = "id";
export type inventory_palletId = inventory_pallet[inventory_palletPk];
export type inventory_palletCreationAttributes = Optional<
  inventory_palletAttributes,
  inventory_palletPk
>;

export class inventory_pallet
  extends Model<inventory_palletAttributes, inventory_palletCreationAttributes>
  implements inventory_palletAttributes
{
  id: number;
  pallet_number?: number;
  work_list_detail_id?: number;
  work_list_id?: number;
  quantity?: number;
  created_at?: Date;
  updated_at?: Date;
  sku?: String;
  inventory_scan_id?: number;

  static initModel(sequelize: Sequelize.Sequelize): typeof inventory_pallet {
    inventory_pallet.init(
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
        work_list_detail_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "work_list_detail",
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
        quantity: {
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
        sku: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        inventory_scan_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "inventory_scan",
            key: "id",
          },
        },
      },
      {
        sequelize,
        tableName: "inventory_pallet",
        timestamps: false,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "id" }],
          },
          {
            name: "IDX_inventoryPalletWorkListDetailid",
            using: "BTREE",
            fields: [{ name: "work_list_detail_id" }],
          },
          {
            name: "IDX_inventoryPalletWorkListId",
            using: "BTREE",
            fields: [{ name: "work_list_id" }],
          },
          {
            name: "IDX_inventoryScanId",
            using: "BTREE",
            fields: [{ name: "inventory_scan_id" }],
          },
        ],
      }
    );
    return inventory_pallet;
  }
}
