import express from 'express';
import { addService, allServices, deleteService, getServiceById, updateService } from '../controllers/serviceController.js';
import verifyToken from '../middleware/verifyToken.js';

const serviceRouter = express.Router();

serviceRouter.post('/addservice',verifyToken,addService)
serviceRouter.get('/allservices', verifyToken,allServices);
serviceRouter.get('/servicebyid', verifyToken, getServiceById);
serviceRouter.patch('/updateservice', verifyToken,updateService);
serviceRouter.delete('/deleteservice', verifyToken,deleteService )

export default serviceRouter;