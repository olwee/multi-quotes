import { Router } from 'express';
import Quote from './quotes';

const router = Router();
router.use('/quotes', Quote);

export default router;
