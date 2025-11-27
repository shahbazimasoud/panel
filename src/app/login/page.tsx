'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Puzzle } from 'lucide-react';
import { useAuth, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { logActivity } from '@/lib/activity-log';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { createAdminUser } from '@/firebase/auth/create-user';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  
  const auth = useAuth();
  const firestore = useFirestore();
  const { user } = useAuth();

  useEffect(() => {
    const setupAdmin = async () => {
        if (auth && !isSetup) {
            const success = await createAdminUser(auth);
            if (success) {
                setIsSetup(true);
            } else {
                setError("Failed to complete initial user setup. Please refresh.");
            }
        }
    };
    setupAdmin();
  }, [auth, isSetup]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!auth || !firestore) {
      setError("Authentication service is not available.");
      return;
    }
    if (!isSetup) {
        setError("Setup is not complete. Please wait a moment and try again.");
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
          // On success, log activity and redirect.
          await logActivity(firestore, userCredential.user.uid, 'LOGIN');
          router.push('/');
      })
      .catch((err: any) => {
          // Handle standard authentication errors first.
          if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
              setError('Incorrect username or password.');
          } else if (err.code === 'auth/permission-denied' || err.name === 'FirebaseError' && err.message.includes('permission-denied')) {
              // This is likely a security rule violation caught during an operation triggered by login.
              // We create and emit a contextual error for debugging.
              const permissionError = new FirestorePermissionError({
                  path: `login_attempt`, // A simulated path for context
                  operation: 'get',      // Login can be seen as a 'get' on a user profile
                  requestResourceData: { email: email }
              });
              errorEmitter.emit('permission-error', permissionError);
              setError('You do not have permission to sign in.');
          }
          else {
              // For other unexpected errors.
              setError('An unexpected error occurred. Please try again.');
              console.error(err);
          }
      });
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Image
        src="https://picsum.photos/seed/loginbg/1920/1080"
        alt="Abstract background"
        fill
        className="object-cover opacity-20"
        data-ai-hint="abstract geometric"
      />
      <Card className="z-10 w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Puzzle className="h-8 w-8" />
          </div>
          <CardTitle className="font-headline text-3xl">OrgConnect</CardTitle>
          <CardDescription>Login to the organization panel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Username</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
              />
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit" className="w-full !mt-6" disabled={!isSetup}>
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
