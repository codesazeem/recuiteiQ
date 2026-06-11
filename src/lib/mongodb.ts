import { MongoClient } from 'mongodb';
import { setServers } from 'dns';

setServers(['8.8.8.8', '8.8.4.4']);
console.log('MongoDB DNS override enabled: 8.8.8.8, 8.8.4.4');

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in environment variables.');
}

const uri = process.env.MONGODB_URI;
console.log('MongoDB URI environment variable is set.');
const options = {
  maxPoolSize: 10,
  serverApi: { version: '1' as const },
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri, options);
    (global as any)._mongoClientPromise = client.connect()
      .then((clientInstance) => {
        console.log('MongoDB Atlas connected successfully. (development)');
        return clientInstance;
      })
      .catch((error: unknown) => {
        console.error('MongoDB Atlas connection failed (development):', error);
        throw error;
      });
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .then((clientInstance) => {
      console.log('MongoDB Atlas connected successfully.');
      return clientInstance;
    })
    .catch((error: unknown) => {
      console.error('MongoDB Atlas connection failed:', error);
      throw error;
    });
}

export default clientPromise;
