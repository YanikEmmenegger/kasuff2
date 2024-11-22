// src/middleware/middleware.ts
import {NextFunction, Request, Response} from 'express';

export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
    // Implement your admin check logic here
    // Placeholder logic using a custom header (not secure for production)
    if (req.headers['only-admin'] === 'true') {
        next();
    } else {
        res.status(403).json({message: 'Unauthorized'});
    }
};
