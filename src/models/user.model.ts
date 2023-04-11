import Sequelize, { Model, Optional } from "sequelize";
import Database from "../database";
import { IUser } from "../interfaces";

interface CreationAttributes extends Optional<IUser, "id"> {}
export interface IUserModel extends Model<IUser, CreationAttributes>, IUser {}
export const users = Database.define<IUserModel>("users", {
   id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
   name: { type: Sequelize.STRING(60), allowNull: false },
   athleticId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
   createdAt: Sequelize.DATE,
   updatedAt: Sequelize.DATE,
});


