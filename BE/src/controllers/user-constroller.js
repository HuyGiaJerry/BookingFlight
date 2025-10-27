
const { StatusCodes } = require('http-status-codes');
const { UserService } = require('../services');
const { UserRepository } = require('../repositories');

const userService = new UserService({ userRepo: new UserRepository() });

async function createUser(req, res) {
    try {
        const user = await userService.create({
            fullname: req.body.fullname,
            phone_number: req.body.phone_number,
            password: req.body.password,
            address: req.body.address,
            google_id: 0,
            facebook_id: 0,
            is_active: 1
        });
        return res
            .status(StatusCodes.CREATED)
            .json(user);
    } catch (error) {
        console.error('Error creating user:', error);
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    createUser
};
