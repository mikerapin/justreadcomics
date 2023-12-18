import dotenv from "dotenv";
// don't move this line down or the DB won't connect correctly
dotenv.config({ path: `./config/.env.${process.env.NODE_ENV}.local` });

export const DB_URL = process.env.DATABASE_URL;

export const isDevelopment = () => {
  return process.env.NODE_ENV === "development";
};

export const isProduction = () => {
  return process.env.NODE_ENV === "production";
};
