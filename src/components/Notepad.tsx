'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import type { Note, NoteDTO } from '@/lib/types';
import { collection, query, orderBy, serverTimestamp, addDoc, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Notebook, Plus, Trash2, Save, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function Notepad() {
  const firestore = useFirestore();
  const { user } = useUser();
  
  const notesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'notes'),
      orderBy('updatedAt', 'desc')
    );
  }, [firestore, user]);

  const { data: notesDTO, isLoading } = useCollection<NoteDTO>(notesQuery);

  const notes: Note[] | null = useMemo(() => {
    if (!notesDTO) return null;
    return notesDTO.map(n => ({
      ...n,
      id: n.id,
      createdAt: n.createdAt?.toMillis(),
      updatedAt: n.updatedAt?.toMillis(),
    }));
  }, [notesDTO]);

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // When a new note is selected from the list, update the editor
  const handleSelectNote = useCallback((note: Note) => {
    // If we're in the middle of creating a new note, don't switch
    if (isCreating) return;
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
  }, [isCreating]);

  // Set up a new note for creation
  const handleNewNoteClick = () => {
    setIsCreating(true);
    setSelectedNote(null);
    setTitle('');
    setContent('');
  };
  
  // Cancel creation or edit
  const handleCancel = () => {
      setIsCreating(false);
      setSelectedNote(null);
      setTitle('');
      setContent('');
  }

  // Save or create a note
  const handleSave = async () => {
    if (!firestore || !user || !title.trim()) return;

    if (isCreating) {
        const noteData = {
            userId: user.uid,
            title: title.trim(),
            content,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };
        const newDocRef = await addDoc(collection(firestore, 'users', user.uid, 'notes'), noteData);
        // After creation, exit creating mode. The new note will appear in the list.
        handleCancel();
    } else if (selectedNote) {
        const noteRef = doc(firestore, 'users', user.uid, 'notes', selectedNote.id);
        await updateDoc(noteRef, {
            title: title.trim(),
            content,
            updatedAt: serverTimestamp(),
        });
        // We don't need to do anything else, the real-time listener will update the UI.
    }
  };

  // Delete a note
  const handleDelete = async (noteId: string) => {
    if (!firestore || !user) return;
    const noteRef = doc(firestore, 'users', user.uid, 'notes', noteId);
    await deleteDoc(noteRef);
    // After deletion, reset the view
    handleCancel();
  };
  
  // Determine if the editor pane should be visible
  const activeView = selectedNote || isCreating;

  // Set the first note as selected on initial load if none is selected
  useEffect(() => {
    if(!selectedNote && !isCreating && notes && notes.length > 0) {
        handleSelectNote(notes[0]);
    }
  }, [notes, selectedNote, isCreating, handleSelectNote]);

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Notebook className="h-6 w-6" />
          <h2 className="text-xl font-bold font-headline">Notepad</h2>
        </div>
      </SidebarHeader>

      <div className="flex flex-1 min-h-0">
        {/* Notes List Pane */}
        <div className={`w-1/3 border-r flex flex-col group-data-[collapsible=icon]:hidden ${activeView ? 'hidden md:block' : 'w-full'}`}>
          <SidebarContent className='p-0'>
            <ScrollArea className="h-full">
              {isLoading && <p className="p-4 text-sm text-muted-foreground">Loading notes...</p>}
              {!isLoading && notes?.length === 0 && (
                <div className='p-4 text-center text-sm text-muted-foreground'>No notes yet. Create one!</div>
              )}
              {notes?.map(note => (
                <button
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={`block w-full text-left p-3 border-b hover:bg-sidebar-accent transition-colors ${selectedNote?.id === note.id ? 'bg-sidebar-accent' : ''}`}
                >
                  <h3 className="font-semibold truncate">{note.title || "Untitled Note"}</h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {note.updatedAt ? formatDistanceToNow(note.updatedAt, { addSuffix: true }) : '...'}
                  </p>
                </button>
              ))}
            </ScrollArea>
          </SidebarContent>
          <SidebarFooter className="p-2 border-t group-data-[collapsible=icon]:hidden">
            <Button onClick={handleNewNoteClick} className="w-full">
              <Plus className="mr-2 h-4 w-4" /> New Note
            </Button>
          </SidebarFooter>
        </div>

        {/* Editor Pane */}
        <div className={`flex-1 group-data-[collapsible=icon]:hidden ${activeView ? 'flex' : 'hidden md:flex'}`}>
          {activeView ? (
            <div className="flex flex-col h-full w-full">
              <div className="p-2 border-b flex items-center gap-2 justify-between">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-bold border-none focus-visible:ring-0 shadow-none flex-1"
                  placeholder="Note Title"
                />
                 {selectedNote && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className='text-muted-foreground hover:text-destructive'>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete this note.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(selectedNote.id)} className='bg-destructive hover:bg-destructive/90'>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              <ScrollArea className="flex-1">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="h-full w-full border-none resize-none focus-visible:ring-0 shadow-none text-base p-4"
                  placeholder="Start writing..."
                />
              </ScrollArea>
              <div className="p-2 border-t flex justify-end gap-2">
                <Button variant="ghost" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <Button onClick={handleSave} disabled={!title.trim()}>
                  <Save className="mr-2 h-4 w-4" /> Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <Notebook className="h-16 w-16 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">Select a note or create a new one</h3>
              <p className="text-sm text-muted-foreground">Your personal space for thoughts and ideas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
