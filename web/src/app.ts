import express from 'express';
import worldObjectRoutes from './routes/worldObjectRoutes';
import uploadRoutes from './routes/uploadRoutes';
import clipgenRoutes from './routes/clipgenRoutes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(express.json());
app.use(express.static('static'));

// Routes
app.use('/api/worldObjects', worldObjectRoutes);
app.use('/upload', uploadRoutes);
app.use('/clipgen', clipgenRoutes);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
