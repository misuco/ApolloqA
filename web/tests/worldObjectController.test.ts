import { Request, Response } from 'express';
import { getWorldObjects } from '../src/controllers/worldObjectController';
import { worldObjects } from '../src/models/worldObject';

describe('WorldObject Controller', () => {
  it('should return an empty array when no items exist', () => {
    // Create mock objects for Request, Response, and NextFunction
    const req = {} as Request;
    const res = {
      json: jest.fn(),
    } as unknown as Response;

    // Ensure that our in-memory store is empty
    worldObjects.length = 0;

    // Execute our controller function
    getWorldObjects(req, res, jest.fn());

    // Expect that res.json was called with an empty array
    expect(res.json).toHaveBeenCalledWith([]);
  });
});
