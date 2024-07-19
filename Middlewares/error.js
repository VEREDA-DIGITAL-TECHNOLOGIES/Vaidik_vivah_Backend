import errorhandler from "../Utils/errorhandler.js";

export const ErrorMiddleware = (err, req, res ,next)=>{
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal server error';

}