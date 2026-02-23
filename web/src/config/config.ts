import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  port_ws: number;
  nodeEnv: string;
  web_path: string;
  sf2_path: string;
  bin_path_midigen: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  port_ws: 3038,
  nodeEnv: process.env.NODE_ENV || 'development',
  web_path: __dirname+'/../../static',
  sf2_path: __dirname+'/../../../sf2',
  bin_path_midigen: __dirname+'/../../../../midigen-build/midigen'
};

export default config;
