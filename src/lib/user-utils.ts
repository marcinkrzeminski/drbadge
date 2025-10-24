import { db } from './instant-server';

export async function getUser(userId: string) {
  try {
    const { users } = await db.query({
      users: { $: { where: { id: userId } } }
    });

    return users && users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Failed to get user:', error);
    throw error;
  }
}

export async function updateUser(userId: string, updates: Record<string, any>) {
  try {
    await db.transact(
      db.tx.users[userId].update(updates)
    );
  } catch (error) {
    console.error('Failed to update user:', error);
    throw error;
  }
}

export async function getUserByAuthId(authId: string) {
  try {
    const { users } = await db.query({
      users: { $: { where: { auth_id: authId } } }
    });

    return users && users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Failed to get user by auth ID:', error);
    throw error;
  }
}