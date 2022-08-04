import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.addColumn("athletics", "adminId", {
         type: DataTypes.INTEGER.UNSIGNED,
         allowNull: true,
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.removeColumn("athletics", "adminId");
   },
};


