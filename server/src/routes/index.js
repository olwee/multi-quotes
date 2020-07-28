import { Router } from 'express';
import Quote from './quotes';

export default ({ pool, Models }) => {
  const router = Router();

  router.use('/quotes', Quote({ pool, Models }));

  return router;
};
