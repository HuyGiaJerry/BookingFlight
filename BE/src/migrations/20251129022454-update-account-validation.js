'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Accounts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
        validate: {
          notEmpty: {
            msg: "Email không được để trống !"
          },
          is: {
            args: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
            msg: "Email không đúng định dạng"
          },
          len: {
            args: [8, 100],
            msg: "Email phải từ 8 đến 100 ký tự !"
          }
        }
      },
      phone: {
        type: Sequelize.STRING
      },
      fullname: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [2, 100],
            msg: "Tên phải từ 2 đến 100 ký tự !"
          },
          is: {
            args: /^[A-Za-zÀ-ỹà-ỹ\s]{2,50}$/,
            msg: "Họ tên chỉ được chứa chữ và khoảng trắng"
          }
        }
      },
      avatar: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          is: {
            args: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            msg: "Password phải ≥ 8 ký tự và gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
          }
        }
      },
      facebook_id: {
        type: Sequelize.STRING
      },
      google_id: {
        type: Sequelize.STRING
      },
      role_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Roles',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      status: {
        type: Sequelize.STRING
      },
      created_by: {
        type: Sequelize.INTEGER
      },
      deleted_by: {
        type: Sequelize.INTEGER
      },
      deleted_at: {
        type: Sequelize.DATE
      },
      deleted: {
        type: Sequelize.BOOLEAN,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Accounts');
  }
};