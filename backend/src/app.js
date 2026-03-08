const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const rtiRoutes = require('./routes/rtiRoutes');
const stageRoutes = require('./routes/stageRoutes');
const documentRoutes = require('./routes/documentRoutes');
const noteRoutes = require('./routes/noteRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const exportRoutes = require('./routes/exportRoutes');
const draftRoutes = require('./routes/draftRoutes');
const authMiddleware = require('./middleware/auth');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

const allowedOrigins = new Set([
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174'
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);

app.use('/api', authMiddleware);
app.use('/api/rti', rtiRoutes);
app.use('/api/stage', stageRoutes);
app.use('/api/document', documentRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/draft', draftRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
