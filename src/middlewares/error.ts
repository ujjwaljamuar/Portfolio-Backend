import type { ErrorRequestHandler } from "express";

type AppError = Error & {
    statusCode?: number;
};

const ErrorMiddleware: ErrorRequestHandler = (
    err: AppError,
    req,
    res,
    next,
) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        message,
    });
};

export default ErrorMiddleware;
