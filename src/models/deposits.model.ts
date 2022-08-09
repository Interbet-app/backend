import Sequelize, { Model, Optional } from "sequelize";
import Database from "../../orm/sequelize";
import { IDeposit } from "../interfaces";

interface CreationAttributes extends Optional<IDeposit, "id"> {}
export interface IDepositModel extends Model<IDeposit, CreationAttributes>, IDeposit {}
export const deposits = Database.define<IDepositModel>("deposits", {
   id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
   userId: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
   amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
   status: { type: Sequelize.ENUM, values: ["pendent", "completed", "canceled"], allowNull: false },
   mp_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
   mp_status: { type: Sequelize.STRING, allowNull: true },
   mp_ticker_url: { type: Sequelize.STRING, allowNull: true },
   mp_qr_code: { type: Sequelize.STRING, allowNull: true },
   mp_expires: { type: Sequelize.DATE, allowNull: true },
   createdAt: Sequelize.DATE,
   updatedAt: Sequelize.DATE,
});

