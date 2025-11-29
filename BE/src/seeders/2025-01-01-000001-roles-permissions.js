// seeders/20251119000000-init-roles-permissions.js  (đè lên file cũ luôn)
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    const allPermissions = [
      'dashboard.access', 'profile.view', 'profile.update',
      'flight.view', 'flight.create', 'flight.edit', 'flight.delete',
      'flight.schedule.manage', 'flight.price.update', 'flight.seatmap.manage',
      'booking.view_own', 'booking.view_any', 'booking.cancel',
      'booking.refund.request', 'booking.refund.approve', 'booking.issue_ticket',
      'user.view', 'user.manage', 'user.ban', 'user.role.assign',
      'role.view', 'role.manage', 'permission.manage',
      'report.revenue', 'report.booking', 'report.daily',
      'service.baggage.manage', 'service.meal.manage',
      'system.config', 'system.logs',
    ];

    const rolesData = [
      { title: 'Super Admin', description: 'Toàn quyền hệ thống' },
      { title: 'Admin', description: 'Quản trị viên cấp cao' },
      { title: 'Staff', description: 'Nhân viên hỗ trợ' },
      { title: 'Customer', description: 'Khách hàng' },
      { title: 'Partner', description: 'Đối tác B2B' },
    ];

    await queryInterface.sequelize.transaction(async (t) => {
      // Bước 1: Tạo roles (không dùng returning)
      await queryInterface.bulkInsert('Roles', rolesData.map(r => ({
        title: r.title,
        description: r.description,
        createdAt: now,
        updatedAt: now,
      })), { transaction: t });

      // Bước 2: Lấy lại danh sách role vừa tạo để có id
      const roles = await queryInterface.sequelize.query(
        `SELECT id, title FROM Roles WHERE title IN ('Super Admin','Admin','Staff','Customer','Partner')`,
        { type: Sequelize.QueryTypes.SELECT, transaction: t }
      );

      // Tạo map title → id
      const roleMap = {};
      roles.forEach(r => roleMap[r.title] = r.id);

      // Bước 3: Chuẩn bị dữ liệu RolePermissions
      const rolePermissions = [];

      // Super Admin → có hết
      allPermissions.forEach(perm => {
        rolePermissions.push({
          role_id: roleMap['Super Admin'],
          permission: perm,
          createdAt: now,
          updatedAt: now,
        });
      });

      // Admin → gần hết (loại vài cái nhạy cảm nếu muốn)
      allPermissions.forEach(perm => {
        if (!['system.logs', 'permission.manage'].includes(perm)) { // ví dụ Admin không được xem log
          rolePermissions.push({
            role_id: roleMap['Admin'],
            permission: perm,
            createdAt: now,
            updatedAt: now,
          });
        }
      });

      // Staff
      ['dashboard.access', 'flight.view', 'booking.view_any', 'booking.cancel', 'report.booking'].forEach(p => {
        rolePermissions.push({ role_id: roleMap['Staff'], permission: p, createdAt: now, updatedAt: now });
      });

      // Customer
      ['dashboard.access', 'profile.view', 'profile.update', 'booking.view_own'].forEach(p => {
        rolePermissions.push({ role_id: roleMap['Customer'], permission: p, createdAt: now, updatedAt: now });
      });

      // Partner
      ['dashboard.access', 'flight.view', 'booking.view_any'].forEach(p => {
        rolePermissions.push({ role_id: roleMap['Partner'], permission: p, createdAt: now, updatedAt: now });
      });

      // Bước 4: Insert RolePermissions
      await queryInterface.bulkInsert('RolePermissions', rolePermissions, { transaction: t });

      // TỰ ĐỘNG GÁN SUPER ADMIN CHO TÀI KHOẢN CỦA BẠN
      await queryInterface.sequelize.query(`
        UPDATE Accounts 
        SET role_id = (SELECT id FROM Roles WHERE title = 'Super Admin' LIMIT 1)
        WHERE phone = '0222222224' 
        LIMIT 1
      `, { transaction: t });

      console.log('Đã gán Super Admin cho 0222222224');
      console.log('Tạo 5 role + permissions thành công! (MySQL compatible)');
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.bulkDelete('RolePermissions', null, { transaction: t });
      await queryInterface.bulkDelete('Roles', {
        title: ['Super Admin', 'Admin', 'Staff', 'Customer', 'Partner']
      }, { transaction: t });
    });
  }
};
