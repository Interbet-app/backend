import Sequelize, { Model, Optional } from "sequelize";
import Database from "../database";
import { IUser } from "../interfaces";

interface CreationAttributes extends Optional<IUser, "id"> {}
export interface IUserModel extends Model<IUser, CreationAttributes>, IUser {}
export const users = Database.define<IUserModel>("users", {
   id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
   name: { type: Sequelize.STRING(60), allowNull: false },
   email: { type: Sequelize.STRING(60), allowNull: false, unique: true },
   teamId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
   affiliateId: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
   externalId: { type: Sequelize.STRING, allowNull: false },
   level: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
   oauth: { type: Sequelize.ENUM, values: ["google", "instagram", "facebook"], allowNull: true },
   picture: { type: Sequelize.STRING, allowNull: true },
   document: { type: Sequelize.STRING, allowNull: true },
   pixAddress: { type: Sequelize.STRING, allowNull: true },
   pixKeyType: { type: Sequelize.ENUM, values: ["CPF", "CNPJ", "EMAIL", "PHONE", "RANDOM"], allowNull: true },
   createdAt: Sequelize.DATE,
   updatedAt: Sequelize.DATE,
});


