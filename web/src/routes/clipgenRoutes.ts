import { Router } from 'express';

import {
  createClip
} from '../controllers/clipgenController';

const router = Router();

router.get('/', createClip);

export default router;
