// FUNCTIONS_EMULATOR is defined when the server is running on the emulator
const dbName = process.env.FUNCTIONS_EMULATOR
  ? 'MongoCollectionDev' // Development
  : 'MongoCollectionPro'; // Production

const mongoURL = new URL('mongodb+srv://clusteraz.ocuif.mongodb.net/');
mongoURL.username = 'Username';
mongoURL.password = 'Password';
mongoURL.pathname = 'Pathname';
mongoURL.searchParams.append('retryWrites', 'true');
mongoURL.searchParams.append('w', 'majority');

console.log(`Using ${mongoURL.toString()}`);

exports.mongoURL = mongoURL;
