const { AccountService } = require('../services');
const { StatusCodes } = require('http-status-codes');
const { Responses } = require('../utils/common');
const accountService = new AccountService()

async function getAccount(req, res, next) {
    try {
        const account = await accountService.getAccount();
        return res
            .status(StatusCodes.OK)
            .json(Responses.SuccessResponse(account, 'Account retrieved successfully', StatusCodes.OK));
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAccount
};
