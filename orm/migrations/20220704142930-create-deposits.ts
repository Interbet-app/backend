import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.createTable("deposits", {
         id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
         uniqueId: { type: DataTypes.STRING, unique: true, allowNull: false },
         userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
         amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
         status: { type: DataTypes.ENUM, values: ["pendent", "completed", "canceled"], allowNull: false },
         externalId: { type: DataTypes.STRING, allowNull: true },
         externalStatus: { type: DataTypes.STRING, allowNull: true },
         externalUrl: { type: DataTypes.STRING, allowNull: true },
         externalQrCode: { type: DataTypes.TEXT("medium"), allowNull: true },
         externalQrCodeContent: { type: DataTypes.TEXT("medium"), allowNull: true },
         expireAt: { type: DataTypes.DATE, allowNull: true },
         externalAmount: { type: DataTypes.INTEGER, allowNull: true },
         createdAt: DataTypes.DATE,
         updatedAt: DataTypes.DATE,
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.dropTable("deposits");
   },
};

