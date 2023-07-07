import Sequelize, { DataTypes, Model, Optional } from "sequelize";

export interface work_list_pickingltlAttributes {
  id: number;
  created_at: Date;
  updated_at: Date;
  name?: string;
  Status?: string;
}

export type work_list_pickingltlPk = "id";
export type work_list_pickingltlId =
  work_list_pickingltl[work_list_pickingltlPk];
export type work_list_pickingltlCreationAttributes = Optional<
  work_list_pickingltlAttributes,
  work_list_pickingltlPk
>;

export class work_list_pickingltl
  extends Model<
    work_list_pickingltlAttributes,
    work_list_pickingltlCreationAttributes
  >
  implements work_list_pickingltlAttributes
{
  id!: number;
  created_at!: Date;
  updated_at!: Date;
  name?: string;
  Status?: string;

  static initModel(
    sequelize: Sequelize.Sequelize
  ): typeof work_list_pickingltl {
    work_list_pickingltl.init(
      {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        Status: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "work_list_pickingltl",
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
    return work_list_pickingltl;
  }
}
