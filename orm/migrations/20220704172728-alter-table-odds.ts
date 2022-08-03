import { QueryInterface } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.removeColumn("odds", "score");
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.addColumn("odds", "score",
         {
            type: "INTEGER",
            allowNull: false,
         }
      );
   },
};

