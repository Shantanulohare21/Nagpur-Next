import { Router, type IRouter } from "express";
import healthRouter from "./health";
import scanRouter from "./scan";
import simulationRouter from "./simulation";
import caseRouter from "./cases";
import reportRouter from "./reports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(scanRouter);
router.use(simulationRouter);
router.use(caseRouter);
router.use(reportRouter);

export default router;
