import express from "express";
import userRouter from './users.routes.js';
import productRouter from './products.routes.js';
import cartRouter from './carts.routes.js';
import messageRouter from './messages.routes.js';
import sessionRouter from "./sessions.routes.js";
import loggerRouter from "./logger.routes.js";
import mockingRouter from "./mocking.routes.js";

const apiRouter = express.Router();


apiRouter.use('/users', userRouter)
route.use('/api/loggerTest', loggerRouter)
apiRouter.use('/products', productRouter)
apiRouter.use('/carts', cartRouter)
apiRouter.use('/message', messageRouter)
apiRouter.use('/sessions', sessionRouter)
apiRouter.use('/mockingproducts', mockingRouter)

export default apiRouter;