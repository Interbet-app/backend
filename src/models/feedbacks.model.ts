import { DataTypes, Model, Optional } from "sequelize";
import Database from "../database";
import { IFeedback } from "../interfaces";

interface FeedbackCreationAttributes extends Optional<IFeedback, "id"> {}
export interface IFeedbackModel extends Model<IFeedback, FeedbackCreationAttributes>, IFeedback {}
export const feedbacks = Database.define<IFeedbackModel>(
   "feedbacks",
   {
      id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      message: { type: DataTypes.TEXT("medium"), allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
   },
   { timestamps: false }
);
