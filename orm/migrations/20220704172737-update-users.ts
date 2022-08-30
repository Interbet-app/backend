import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.addColumn("users", "document", { type: DataTypes.STRING, allowNull: true });
      await queryInterface.addColumn("users", "pixAddress", { type: DataTypes.STRING, allowNull: true });
      await queryInterface.addColumn("users", "pixKeyType", {
         type: DataTypes.ENUM,
         values: ["CPF", "CNPJ", "EMAIL", "PHONE", "RANDOM"],
         allowNull: true,
      });
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.removeColumn("users", "document");
      await queryInterface.removeColumn("users", "pixAddress");
      await queryInterface.removeColumn("users", "pixKeyType");
   },
};

