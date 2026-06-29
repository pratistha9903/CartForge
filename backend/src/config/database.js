import mongoose from 'mongoose';

let memoryServer = null;

async function connectWithUri(uri) {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
}

async function startMemoryServer() {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  memoryServer = await MongoMemoryServer.create();
  return memoryServer.getUri();
}

export async function connectDatabase() {
  mongoose.set('strictQuery', true);

  const uri = process.env.MONGODB_URI;
  const useMemoryOnly = process.env.USE_MEMORY_DB === 'true';

  if (useMemoryOnly) {
    const memoryUri = await startMemoryServer();
    await connectWithUri(memoryUri);
    console.log('MongoDB connected (in-memory dev database)');
    return;
  }

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  try {
    await connectWithUri(uri);
    console.log('MongoDB connected');
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('\nLocal MongoDB is not running.');
      console.warn('Starting an in-memory database so you can develop without Docker.\n');

      const memoryUri = await startMemoryServer();
      await connectWithUri(memoryUri);
      console.log('MongoDB connected (in-memory dev database)');
      console.log('Tip: use Docker/Atlas for persistent data, or set USE_MEMORY_DB=true to skip the retry.\n');
      return;
    }

    console.error('\nMongoDB connection failed.');
    console.error('Make sure MongoDB is running before starting the backend.\n');
    console.error('Quick fix (Docker):');
    console.error('  1. Start Docker Desktop');
    console.error('  2. Run: docker compose up -d   (from project root)\n');
    console.error('Or use MongoDB Atlas and set MONGODB_URI in backend/.env\n');
    throw error;
  }
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

export default mongoose;
