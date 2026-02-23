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
  web_path: '/home/c1/github/ApolloqA/web-ts/static',
  sf2_path: '/home/c1/apolloqa/sf2',
  bin_path_midigen: '/home/c1/github/midigen-build/midigen'
};

export default config;
