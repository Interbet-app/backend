import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.changeColumn("deposits", "externalQrCode", {
         type: DataTypes.TEXT("medium"),
         allowNull: true,
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.changeColumn("deposits", "externalQrCode", {
         type: DataTypes.STRING(255),
         allowNull: true,
      });
   },
};

