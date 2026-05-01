import { Request, Response, NextFunction } from 'express';
import { worldObjects, WorldObject  } from '../models/worldObject';
import * as express from 'express';

// Create an item
export const createWorldObject = (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("createWorldObject "+req.body);
    const { url, name, creator, mesh, x, y, z, follow, angleX, angleY, angleZ, radiusL, radiusF, radiusR, radiusB, rotate } = req.body;
    const newWorldObject: WorldObject = { url, name, creator, mesh, x, y, z, follow, angleX, angleY, angleZ, radiusL, radiusF, radiusR, radiusB, rotate };
    worldObjects.push(newWorldObject);
    res.status(201).json(newWorldObject);
  } catch (error) {
    next(error);
  }
};

// Read all worldObjects
export const getWorldObjects = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(worldObjects);
  } catch (error) {
    next(error);
  }
};

// Read single item
export const getWorldObjectById = (req: Request, res: Response, next: NextFunction) => {
  try {
    const url = req.params.url[0];
    const item = worldObjects.find((i) => i.url === url);
    if (!item) {
      res.status(404).json({ message: 'WorldObject not found' });
      return;
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
};

// Update an item
export const updateWorldObject = (req: Request, res: Response, next: NextFunction) => {
  try {
    const url = req.params.url[0];
    const { worldObject } = req.body;
    const itemIndex = worldObjects.findIndex((i) => i.url === url);
    if (itemIndex === -1) {
      res.status(404).json({ message: 'WorldObject not found' });
      return;
    }
    worldObjects[itemIndex] = worldObject;
    res.json(worldObjects[itemIndex]);
  } catch (error) {
    next(error);
  }
};

// Delete an item
export const deleteWorldObject = (req: Request, res: Response, next: NextFunction) => {
  try {
    const url = req.params.url[0];
    const itemIndex = worldObjects.findIndex((i) => i.url === url);
    if (itemIndex === -1) {
      res.status(404).json({ message: 'WorldObject not found' });
      return;
    }
    const deletedWorldObject = worldObjects.splice(itemIndex, 1)[0];
    res.json(deletedWorldObject);
  } catch (error) {
    next(error);
  }
};
