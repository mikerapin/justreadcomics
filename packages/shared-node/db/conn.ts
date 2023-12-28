import { connect } from 'mongoose';

const connectToServer = async function () {
  await connect(process.env.DATABASE_URL || '', { dbName: 'justreadcomics' });
  console.log('connected to db');
};
export { connectToServer };
