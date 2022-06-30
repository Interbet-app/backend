import Sequelize, { Model, Optional } from "sequelize";
import Database from "../../orm/sequelize";
import { IUser } from "../interfaces";

interface CreationAttributes extends Optional<IUser, "id"> {}
export interface IUserModel extends Model<IUser, CreationAttributes>, IUser {}
export const users = Database.define<IUserModel>("users", {
   id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
   name: { type: Sequelize.STRING, allowNull: false },
   email: { type: Sequelize.STRING, allowNull: false, unique: true },
   team: { type: Sequelize.STRING, allowNull: true },
   affiliateId: { type: Sequelize.INTEGER, allowNull: true },
   createdAt: Sequelize.DATE,
   updatedAt: Sequelize.DATE,
});
