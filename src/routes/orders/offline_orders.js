import express from "express";
import OfflineOrdersController from "../../Controllers/Orders/offline_orders";
import Authentication from "../../middleware/Authentication";


const router = express.Router()

router.post('/addOrder', Authentication , OfflineOrdersController.add_order);

// router.get('/getOrders/:id', CustomerAuthentication, OrdersController.getCustomer_orders);

router.get('/getOrders', Authentication, OfflineOrdersController.get_orders);

// router.get('/getCustomerOngoingOrders/:id', CustomerAuthentication, OrdersController.getCustomerOngoing);

// router.get('/getAdminOtherOrders', Authentication, OrdersController.getAdminOtherOrders);

export default router