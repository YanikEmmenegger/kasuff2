import {NextFunction, Request, Response} from 'express';
import Visitor from '../models/Visitor';

export const logVisitor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.cookies.visitor_logged) {
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP';
            const userAgent = req.headers['user-agent'] || 'Unknown';
            const referer = req.headers['referer'] || 'Direct';
            const acceptLanguage = req.headers['accept-language'] || 'Unknown';

            // Log the visitor's details in the database
            await Visitor.create({
                ipAddress,
                userAgent,
                referer,
                acceptLanguage,
                visitTime: new Date()
            });
            console.log(`Visitor logged: IP - ${ipAddress}, User-Agent - ${userAgent}, Referer - ${referer}, Language - ${acceptLanguage}`);

            // Set a cookie to avoid duplicate logging
            res.cookie('visitor_logged', 'true', {maxAge: 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            console.log('Visitor already logged, skipping.');
        }
    } catch (error) {
        console.error('Error logging visitor:', error);
    }
    next();
};
