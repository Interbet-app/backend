import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.addColumn("teams", "adminId", {
         type: DataTypes.INTEGER.UNSIGNED,
         allowNull: true,
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.removeColumn("teams", "adminId");
   },
};

