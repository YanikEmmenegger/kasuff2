// src/routes/visitorRoutes.ts
import {Request, Response, Router} from 'express';
import Visitor from '../models/Visitor';

const router = Router();

router.get('/visitors', async (req: Request, res: Response) => {
    try {
        const visitors = await Visitor.find().sort({visitTime: -1});
        res.json({
            count: visitors.length,
            visitors: visitors
        });
    } catch (error) {
        res.status(500).json({message: 'Error fetching visitors', error});
    }
});

export default router;
