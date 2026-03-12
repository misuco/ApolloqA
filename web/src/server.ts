import config from './config/config';
import app from './app';
import initWs from './ws';

// start server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

initWs();
