import { Model, DataTypes } from "sequelize";
import Database from "../../orm/sequelize";
import { IGameHistory } from "../interfaces";

export interface IGameHistoryModel extends Model<IGameHistory>, IGameHistory {}
export const gamesHistory = Database.define<IGameHistoryModel>(
   "games-history",
   {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      event: { type: DataTypes.STRING(40), allowNull: false },
      teamA: { type: DataTypes.STRING(40), allowNull: false },
      teamB: { type: DataTypes.STRING(40), allowNull: false },
      scoreA: { type: DataTypes.INTEGER, allowNull: false },
      scoreB: { type: DataTypes.INTEGER, allowNull: false },
      ref_table: { type: DataTypes.STRING(60), allowNull: true },
      date: { type: DataTypes.DATE, allowNull: false },
   },
   {
      timestamps: false,
      freezeTableName: true,
   }
);


