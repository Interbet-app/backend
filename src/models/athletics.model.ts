import Sequelize, { Model, Optional } from "sequelize";
import Database from "../../orm/sequelize";
import { IAthletic } from "../interfaces";

interface CreationAttributes extends Optional<IAthletic, "id"> { }
export interface IAthleticModel extends Model<IAthletic, CreationAttributes>, IAthletic { }
export const athletics = Database.define<IAthleticModel>("athletics", {
   id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
   adminId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
   name: { type: Sequelize.STRING(60), allowNull: false },
   abbreviation: { type: Sequelize.STRING(20), allowNull: false },
   picture: { type: Sequelize.STRING, allowNull: true },
   createdAt: Sequelize.DATE,
   updatedAt: Sequelize.DATE,
});

