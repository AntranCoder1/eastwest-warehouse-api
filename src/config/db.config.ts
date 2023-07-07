const port: number = 8888;

const host: string = "localhost";

const config = {
  uiUrl: "http://localhost:4200",
  apiUrl: "http://localhost:8888",
  HOST: host,
  USER: "root",
  PASSWORD: "",
  DB: "eastwest_warehouse",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  PORT: port,
  JWT_SECRET: "SEED_JWT_SECRET_HERE",
  MAIL_API_KEY: "AIzaSyC6z9HwqTHgaHVP6Y073HkkuFUWUaiAhhw",
};

export default config;
