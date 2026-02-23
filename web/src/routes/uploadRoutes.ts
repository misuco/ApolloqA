import { Router } from 'express';

import {
  createUpload
} from '../controllers/uploadController';

const router = Router();

router.post('/', createUpload);

export default router;
