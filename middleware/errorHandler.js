const { constants } = require('../constants');

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
    switch(statusCode){
        case constants.NOT_FOUND:
            res.status(constants.NOT_FOUND).json({
                title: 'Not Found Error',
                message: err.message,
                stackTrace: err.stack,
            });
        break;

        case constants.VALIDATION_ERROR:
            res.status(constants.VALIDATION_ERROR).json({
                title: 'Validation Error',
                message: err.message,
                stackTrace: err.stack
            });
        break;
        case constants.FORBIDDEN:
            res.status(constants.FORBIDDEN).json({
                title: 'Forbiden',
                message: err.message,
                stackTrace: err.stack
            });
        break;
        case constants.SERVER_ERROR:
            res.status(constants.SERVER_ERROR).json({
                title: 'Server Error',
                message: err.message,
                stackTrace: err.stack
            });
            break;
        default:
            res.status(500).json({
                title: 'Unknown Error',
                message: err.message,
                stackTrace: err.stack
            });
            break;
    }
};

module.exports = errorHandler;