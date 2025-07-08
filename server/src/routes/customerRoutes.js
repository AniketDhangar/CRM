import express from "express";
import { addCustomer, deleteCustomer, deleteCustomers, getCustomerById, getCustomers, updateCustomer } from "../controllers/customerController.js";
import verifyToken from "../middleware/verifyToken.js";

const customerRouter = express.Router();

customerRouter.post('/addcustomer', addCustomer);
customerRouter.get('/getcustomers',verifyToken,getCustomers);
customerRouter.post('/getbyid',verifyToken,getCustomerById);
customerRouter.patch('/updatecustomer',verifyToken,updateCustomer);
customerRouter.delete('/deletecustomer',verifyToken,deleteCustomer)
customerRouter.delete('/deletecustomers',verifyToken,deleteCustomers);


export default customerRouter;
