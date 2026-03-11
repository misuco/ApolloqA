import { Router } from 'express';

import {
  createWorldObject,
  getWorldObjects,
  getWorldObjectById,
  updateWorldObject,
  deleteWorldObject
} from '../controllers/worldObjectController';

const router = Router();

router.get('/', getWorldObjects);
router.get('/:id', getWorldObjectById);
router.post('/', createWorldObject);
router.put('/:id', updateWorldObject);
router.delete('/:id', deleteWorldObject);

export default router;
