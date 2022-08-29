import { QueryInterface ,DataTypes} from "sequelize";

module.exports = {
   async up(queryInterface: QueryInterface) {
      await queryInterface.addColumn("deposits", "uniqueId", { type: DataTypes.STRING, allowNull: true });
      await queryInterface.renameColumn("deposits", "externalId", "externalTransactionId");
   },

   async down(queryInterface: QueryInterface) {
      await queryInterface.removeColumn("deposits", "uniqueId");
      await queryInterface.renameColumn("deposits", "externalTransactionId", "externalId");
   },
};


