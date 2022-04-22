const express = require("express")
const router=express.Router()
const userControllers = require("../controllers/userController")
const productControllers = require("../controllers/productController")
const cartControllers=require('../controllers/cartController')
const orderControllers=require('../controllers/orderController')
const middleware = require("../middleware/auth")

//=========================================FOR USER================================================================================

router.post('/register',userControllers.createUser)
router.post('/login',userControllers.login)
router.get('/user/:userId/profile',middleware.authentication,userControllers.getUser)
router.put('/user/:userId/profile',middleware.authentication,middleware.authorization,userControllers.updateUser)

//=========================================FOR PRODUCT====================================================================

router.post('/products',productControllers.createProduct)
router.get('/products',productControllers.getProduct)
router.get('/products/:productId',productControllers.getProductById)
router.put('/products/:productId',productControllers. updateProduct)
router.delete('/products/:productId',productControllers.deleteProductByid)

//========================================FOR CART==========================================================================

router.post('/users/:userId/cart',middleware.authentication,middleware.authorization,cartControllers.createCart)
router.put('/users/:userId/cart',middleware.authentication,middleware.authorization,cartControllers.updateCart)
router.get('/users/:userId/cart',middleware.authentication,middleware.authorization,cartControllers.getCart)
router.delete('/users/:userId/cart',middleware.authentication,middleware.authorization,cartControllers.deleteCart)

//=========================================FOR ORDER===================================================================

router.post('/users/:userId/orders',middleware.authentication,middleware.authorization,orderControllers.order)
router.put('/users/:userId/orders',middleware.authentication,middleware.authorization,orderControllers.updateOrder)


module.exports=router
