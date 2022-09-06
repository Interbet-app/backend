import Sequelize, { Model, Optional } from "sequelize";
import Database from "../database";
import { ITeam } from "../interfaces";

interface CreationAttributes extends Optional<ITeam, "id"> {}
export interface ITeamModel extends Model<ITeam, CreationAttributes>, ITeam {}
export const teams = Database.define<ITeamModel>("teams", {
   id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
   adminId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
   athleticId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
   name: { type: Sequelize.STRING(60), allowNull: false },
   abbreviation: { type: Sequelize.STRING(20), allowNull: false },
   location: { type: Sequelize.STRING(80), allowNull: false },
   picture: { type: Sequelize.STRING, allowNull: true },
   createdAt: Sequelize.DATE,
   updatedAt: Sequelize.DATE,
});
