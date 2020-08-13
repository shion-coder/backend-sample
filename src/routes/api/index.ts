import { Router } from 'express';

import { authRouter } from './auth';
import { usersRouter } from './users';
import { postRouter } from './post';

/* -------------------------------------------------------------------------- */

/**
 * API Router for /api
 */

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);

apiRouter.use('/users', usersRouter);

apiRouter.use('/post', postRouter);
