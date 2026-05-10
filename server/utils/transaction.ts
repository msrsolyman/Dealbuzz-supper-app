import mongoose from 'mongoose';

/**
 * Execute a function within a mongoose transaction.
 * @param callback Async function passing the mongoose ClientSession.
 */
export const runInTransaction = async <T>(callback: (session: mongoose.ClientSession) => Promise<T>): Promise<T> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
