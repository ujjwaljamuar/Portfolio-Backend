import type { NextFunction, Request, Response } from "express";

type AsyncHandler = (
    req: Request,
    res: Response,
    next: NextFunction,
) => Promise<unknown>;

export const catchAsyncError =
    (passedFunction: AsyncHandler) =>
    (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(passedFunction(req, res, next)).catch(next);
    };
