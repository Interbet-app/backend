import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.createTable("odds", {
         id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
         gameId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
         name: { type: DataTypes.STRING(60), allowNull: false },
         teamId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
         startPayOut: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
         payout: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
         amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
         maxBetAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
         payment: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
         bets: { type: DataTypes.INTEGER, allowNull: false },
         offer: { type: DataTypes.BOOLEAN, allowNull: false },
         status: { type: DataTypes.ENUM("open", "lock"), allowNull: false },
         createdAt: DataTypes.DATE,
         updatedAt: DataTypes.DATE,
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.dropTable("odds");
   },
};


