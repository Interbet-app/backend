import { QueryInterface } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.addConstraint("bets", {
         fields: ["userId"],
         type: "foreign key",
         name: "FK_bets.userId_to_users.id",
         references: {
            table: "users",
            field: "id",
         },
         onDelete: "cascade",
         onUpdate: "cascade",
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.removeConstraint("bets", "FK_bets.userId_to_users.id");
   },
};

