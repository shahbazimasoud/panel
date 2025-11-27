'use client';

import { Auth, createUserWithEmailAndPassword } from 'firebase/auth';

// This is a one-time use function to create the admin user.
// It will be removed after the user is created.
export const createAdminUser = async (auth: Auth) => {
  try {
    // Check if the user already exists by trying to sign in first.
    // This is a workaround as there's no direct `fetchUserByEmail` on the client.
    // We expect this to fail if the user doesn't exist.
    // A better approach would be a Cloud Function, but for this setup, we'll proceed.
    console.log('Attempting to create admin user...');
    await createUserWithEmailAndPassword(auth, 'admin@example.com', 'password');
    console.log('Admin user created successfully.');
    return true;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin user already exists.');
      return true; // User already exists, so we consider it a success.
    }
    console.error('Error creating admin user:', error);
    return false;
  }
};
