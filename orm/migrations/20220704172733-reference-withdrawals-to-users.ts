import { QueryInterface } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.addConstraint("withdrawals", {
         fields: ["userId"],
         type: "foreign key",
         name: "FK_withdrawals.userId_to_users.id",
         references: {
            table: "users",
            field: "id",
         },
         onDelete: "cascade",
         onUpdate: "cascade",
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.removeConstraint("withdrawals", "FK_withdrawals.userId_to_users.id");
   },
};
