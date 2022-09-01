import { QueryInterface } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.addColumn("odds", "startPayOut", {
         type: "DECIMAL(10, 2)",
         allowNull: false,
         defaultValue: 0,
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.removeColumn("odds", "startPayOut");
   },
};

