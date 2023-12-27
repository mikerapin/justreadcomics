import { connect } from 'mongoose';
import { DB_URL } from '@justreadcomics/common/dist/util/process';

const connectToServer = async function () {
  await connect(DB_URL || '', { dbName: 'justreadcomics' });
  console.log('connected to db');
};
export { connectToServer };
