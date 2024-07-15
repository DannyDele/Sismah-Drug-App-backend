// class AppError extends Error {
//   constructor(message, statusCode) {
//     super(message);
//     this.statusCode = statusCode;
//     this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
//     this.isOperational = true;

//     Error.captureStackTrace(this, this.constructor);
//   }
// }

// module.exports = AppError;



class AppError extends Error{
    constructor (message, status) {
        super()
        this.message = message;
        this.status = status;
    }
}


module.exports = AppError;