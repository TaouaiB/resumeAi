// src/app.ts
import express from "express";
import dotenv from "dotenv";
import { errorHandler } from "./middlewares/errorHandler";
import resumeRoute from "./modules/resume/routes/resume.route";

dotenv.config();

const app = express();

app.use(express.json());

// Resume module
app.use("/api/resume", resumeRoute);

// Global error handler
app.use(errorHandler);

export default app;
