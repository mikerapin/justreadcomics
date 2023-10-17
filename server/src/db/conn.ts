const DB_URL = process.env.DATABASE_URL;
import { connect } from 'mongoose';

const connectToServer = async function () {
  await connect(DB_URL + 'justreadcomics');
  console.log('connected to db');
};
export { connectToServer };
