'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Puzzle } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase'; // Changed
import { logActivity } from '@/lib/activity-log'; // Changed
import { signInWithEmailAndPassword } from 'firebase/auth'; // Changed

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  
  const auth = useAuth();
  const firestore = useFirestore();
  const { user } = useAuth(); // Changed

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => { // Changed
    e.preventDefault();
    setError('');
    if (!auth || !firestore) {
      setError("Authentication service is not available.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // The auth state change will be handled by the provider
      // and the useEffect above will redirect.
      // We can log the initial login activity here.
      await logActivity(firestore, userCredential.user.uid, 'LOGIN');
      router.push('/');

    } catch (err: any) {
       if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Incorrect username or password.');
       } else {
        setError('An unexpected error occurred. Please try again.');
        console.error(err);
       }
    }
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
            <Button type="submit" className="w-full !mt-6">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
