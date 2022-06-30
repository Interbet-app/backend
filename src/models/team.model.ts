import Sequelize, { Model, Optional } from "sequelize";
import Database from "../../orm/sequelize";
import { ITeam } from "../interfaces";

interface CreationAttributes extends Optional<ITeam, "id"> {}
export interface ITeamModel extends Model<ITeam, CreationAttributes>, ITeam {}
export const teams = Database.define<ITeamModel>("teams", {
   id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
   name: { type: Sequelize.STRING, allowNull: false },
   abbreviation: { type: Sequelize.STRING, allowNull: false },
   location: { type: Sequelize.STRING, allowNull: false },
   picture: { type: Sequelize.STRING, allowNull: true },
   createdAt: Sequelize.DATE,
   updatedAt: Sequelize.DATE,
});
