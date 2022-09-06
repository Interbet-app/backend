import Sequelize, { Model, Optional } from "sequelize";
import Database from "../database";
import { IAdds } from "../interfaces";

interface CreationAttributes extends Optional<IAdds, "id"> { }
export interface IAddsModel extends Model<IAdds, CreationAttributes>, IAdds { }
export const adds = Database.define<IAddsModel>("adds", {
   id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
   image: { type: Sequelize.STRING, allowNull: false },
   url: { type: Sequelize.STRING, allowNull: false },
   createdAt: Sequelize.DATE,
   updatedAt: Sequelize.DATE,
});
