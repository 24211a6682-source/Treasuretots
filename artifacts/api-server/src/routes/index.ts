import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import productsRouter from "./products";
import cartRouter from "./cart";
import ordersRouter from "./orders";
import usersRouter from "./users";
import adminRouter from "./admin";
import geocodeRouter from "./geocode";
import webhooksRouter from "./webhooks";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(productsRouter);
router.use(cartRouter);
router.use(ordersRouter);
router.use(usersRouter);
router.use(adminRouter);
router.use(geocodeRouter);
router.use(webhooksRouter);

export default router;
