'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Tạo event để tự động xóa các session đã hết hạn
    await queryInterface.sequelize.query(`
      CREATE EVENT IF NOT EXISTS auto_delete_expired_sessions
      ON SCHEDULE EVERY 1 HOUR
      DO
        DELETE FROM Sessions WHERE expire_at < NOW();
    `);
  },

  async down (queryInterface, Sequelize) {
    // Xóa event khi rollback migration
    await queryInterface.sequelize.query(`
      DROP EVENT IF EXISTS auto_delete_expired_sessions;
    `);
  }
};
