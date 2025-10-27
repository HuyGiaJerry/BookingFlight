
const { UserRepository } = require('../repositories');
class UserService {
    constructor({userRepo}){
        this.userRepository = new UserRepository();
    }

    async create(data,options = {}) {
        try {
            const newUser = await this.userRepository.create(data,options);
            return newUser;
        } catch (error) {
            throw error;
        }
    }



}
module.exports = UserService;