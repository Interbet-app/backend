import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.createTable("deposits", {
         id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
         userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
         amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
         status: { type: DataTypes.ENUM, values: ["pendent", "completed", "canceled"], allowNull: false },
         mp_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
         mp_status: { type: DataTypes.STRING, allowNull: true },
         mp_ticker_url: { type: DataTypes.STRING, allowNull: true },
         mp_qr_code: { type: DataTypes.STRING, allowNull: true },
         mp_expires: { type: DataTypes.DATE, allowNull: true },
         createdAt: DataTypes.DATE,
         updatedAt: DataTypes.DATE,
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.dropTable("deposits");
   },
};

