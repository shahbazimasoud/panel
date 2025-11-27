'use client';

import { Auth, createUserWithEmailAndPassword } from 'firebase/auth';
import { FirestorePermissionError } from '../errors';
import { errorEmitter } from '../error-emitter';

// This is a one-time use function to create the admin user.
export const createAdminUser = async (auth: Auth) => {
    try {
        // Attempting to create the user. If it fails with 'auth/email-already-in-use',
        // we know the user is already set up, which is a success condition for this function.
        await createUserWithEmailAndPassword(auth, 'admin@example.com', 'password');
        console.log('Admin user created successfully.');
        return true;
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            console.log('Admin user already exists.');
            return true; // This is a success condition for our setup logic.
        }

        // For other errors, particularly permission errors that might manifest here,
        // we wrap and emit them using our custom error handling architecture.
        // While a direct permission error on createUser is less common, this pattern
        // ensures consistent error handling if project setup changes.
        const permissionError = new FirestorePermissionError({
            path: `users/admin@example.com`, // Simulated path for context
            operation: 'create',
            requestResourceData: { email: 'admin@example.com' },
        });

        // Use the global emitter to propagate the error for debugging.
        errorEmitter.emit('permission-error', permissionError);

        console.error('Error creating admin user:', error);
        return false;
    }
};
