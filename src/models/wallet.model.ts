import Sequelize, { Model, Optional } from "sequelize";
import Database from "../../orm/sequelize";
import { IWallet } from "../interfaces";

interface CreationAttributes extends Optional<IWallet, "id"> {}
export interface IWalletModel extends Model<IWallet, CreationAttributes>, IWallet {}
export const wallets = Database.define<IWalletModel>("wallets", {
   id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
   userId: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
   balance: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
   bonus: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
   score: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
   createdAt: Sequelize.DATE,
   updatedAt: Sequelize.DATE,
});
