import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import scanRouter from "./scan.js";
import simulationRouter from "./simulation.js";
import caseRouter from "./cases.js";
import reportRouter from "./reports.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(scanRouter);
router.use(simulationRouter);
router.use(caseRouter);
router.use(reportRouter);

export default router;
