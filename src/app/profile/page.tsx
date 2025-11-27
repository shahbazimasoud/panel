'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { users } from '@/lib/data';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import PageHeader from '@/components/PageHeader';

// This is a mock. In a real app, you'd get this from a session/context.
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
  }, []);

  const user = isAuthenticated ? users.find((u) => u.id === '1') : null; // Mock: Arash Shams
  return { user };
};

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [bio, setBio] = useState('');
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (user) {
      const savedBio = user.bio || '';
      setBio(savedBio);
      setCharCount(savedBio.length);
    }
  }, [user]);

  if (!user) {
    // This can be a loading state or null if MainLayout handles redirection
    return null;
  }
  
  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= 200) {
      setBio(text);
      setCharCount(text.length);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would save this to your backend.
    // For now, we can update the mock data if we want, but it won't persist.
    const userIndex = users.findIndex(u => u.id === user.id);
    if(userIndex !== -1) {
        users[userIndex].bio = bio;
    }
    console.log('Updated bio:', bio);
    toast({
      title: 'Profile Updated',
      description: 'Your status has been successfully saved.',
    });
  };
  
  const fallback = user.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <MainLayout>
      <PageHeader />
      <div className="container mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
            <h1 className="text-3xl font-bold font-headline">Your Profile</h1>
            <p className="text-muted-foreground">Manage your personal information and status.</p>
        </div>
        <Card>
            <CardHeader>
            <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="text-4xl">{fallback}</AvatarFallback>
                </Avatar>
                <div>
                <CardTitle className="text-3xl">{user.name}</CardTitle>
                <CardDescription className="text-lg">{user.department}</CardDescription>
                </div>
            </div>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user.email} disabled />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="extension">Extension</Label>
                    <Input id="extension" value={user.extension || 'N/A'} disabled />
                    </div>
                </div>
                <div className="space-y-2">
                <Label htmlFor="bio">Status Message (Bio)</Label>
                <Textarea
                    id="bio"
                    placeholder="What are you working on?"
                    value={bio}
                    onChange={handleBioChange}
                    className="min-h-[100px]"
                    maxLength={200}
                />
                <p className="text-right text-sm text-muted-foreground">
                    {charCount} / 200
                </p>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/">Cancel</Link>
                    </Button>
                <Button type="submit">Save Changes</Button>
                </div>
            </form>
            </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
