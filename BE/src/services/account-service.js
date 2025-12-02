const { UserRepository } = require('../repositories');
const { Op } = require('sequelize');
class AccountService {
    constructor(userRepository) {
        this.userRepository = userRepository || new UserRepository();
    }

    async getAccount() {
        try {
            const account = await this.userRepository.getAccount();
            return account;
        } catch (error) {
            console.error('Error getting account:', error);
            throw error;
        }
    }
}


module.exports = AccountService;
