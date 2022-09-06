import { Model, Optional, DataTypes } from "sequelize";
import { IRanking } from "../interfaces";
import Database from "../database";

interface RankingCreationAttributes extends Optional<IRanking, "id"> {}
export interface RankingModel extends Model<IRanking, RankingCreationAttributes>, IRanking {}
export const rankings = Database.define<RankingModel>(
   "rankings",
   {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      eventId: { type: DataTypes.INTEGER, allowNull: false },
      teamId: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING(60), allowNull: false },
      score: { type: DataTypes.INTEGER, allowNull: false },
      wins: { type: DataTypes.INTEGER, allowNull: false },
      draws: { type: DataTypes.INTEGER, allowNull: false },
      losses: { type: DataTypes.INTEGER, allowNull: false },
      goalFor: { type: DataTypes.INTEGER, allowNull: false },
      goalAgainst: { type: DataTypes.INTEGER, allowNull: false },
      goalDifference: { type: DataTypes.INTEGER, allowNull: false },
   },
   { timestamps: false }
);

