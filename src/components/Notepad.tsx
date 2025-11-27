'use client';

import { useState, useEffect, useMemo, useCallback, useLayoutEffect, useRef } from 'react';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import type { Note, NoteDTO } from '@/lib/types';
import { collection, query, orderBy, serverTimestamp, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Notebook, Plus, Trash2, FilePen, Users } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

// Debounce hook for auto-saving
const useDebounce = (value: any, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

// Custom hook to auto-resize textarea
const useAutoResizeTextarea = (value: string) => {
    const ref = useRef<HTMLTextAreaElement>(null);
    useLayoutEffect(() => {
        const textarea = ref.current;
        if (textarea) {
            textarea.style.height = 'auto'; // Reset height
            textarea.style.height = `${textarea.scrollHeight}px`; // Set to scroll height
        }
    }, [value]);
    return ref;
};


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

  const debouncedTitle = useDebounce(title, 1500);
  const debouncedContent = useDebounce(content, 1500);
  const textareaRef = useAutoResizeTextarea(content);


  // Auto-save logic
  useEffect(() => {
    if (!firestore || !user || isCreating) return;

    if (selectedNote && (debouncedTitle !== selectedNote.title || debouncedContent !== selectedNote.content)) {
      if (!debouncedTitle.trim()) return; // Don't save if title is empty
      
      const noteRef = doc(firestore, 'users', user.uid, 'notes', selectedNote.id);
      const updatedData = {
          title: debouncedTitle.trim(),
          content: debouncedContent,
          updatedAt: serverTimestamp(),
          userId: user.uid // Ensure userId is present for security rules
      };
      updateDoc(noteRef, updatedData).catch(error => {
        const permissionError = new FirestorePermissionError({
          path: noteRef.path,
          operation: 'update',
          requestResourceData: updatedData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    }
  }, [debouncedTitle, debouncedContent, selectedNote, firestore, user, isCreating]);

  // When a new note is selected from the list, update the editor
  const handleSelectNote = useCallback((note: Note) => {
    setIsCreating(false);
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
  }, []);
  
  // Create a new note and select it
  const handleNewNoteClick = async () => {
    if (!firestore || !user) return;
    
    setIsCreating(true); // Go into creating mode
    const noteData = {
        userId: user.uid,
        title: "Untitled Note",
        content: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };
    const notesCollection = collection(firestore, 'users', user.uid, 'notes');
    try {
        const docRef = await addDoc(notesCollection, noteData);
        // We don't need to manually select it. The real-time listener will add it to the list
        // and the useEffect below will select the newest one.
    } catch(error) {
        const permissionError = new FirestorePermissionError({
          path: notesCollection.path,
          operation: 'create',
          requestResourceData: noteData,
        });
        errorEmitter.emit('permission-error', permissionError);
    } finally {
        setIsCreating(false);
    }
  };

  // Delete a note
  const handleDelete = async (noteId: string) => {
    if (!firestore || !user) return;
    const noteRef = doc(firestore, 'users', user.uid, 'notes', noteId);
    
    // Optimistically select the next note
    if (selectedNote?.id === noteId && notes) {
        const currentIndex = notes.findIndex(n => n.id === noteId);
        if (currentIndex > 0) {
            handleSelectNote(notes[currentIndex - 1]);
        } else if (notes.length > 1) {
            handleSelectNote(notes[1]);
        } else {
            setSelectedNote(null);
            setTitle('');
            setContent('');
        }
    }

    deleteDoc(noteRef).catch(error => {
        const permissionError = new FirestorePermissionError({
            path: noteRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };
  
  // Determine if the editor pane should be visible
  const activeView = selectedNote || isCreating;

  // Set the first note as selected on initial load or when notes change
  useEffect(() => {
    if(!selectedNote && notes && notes.length > 0) {
        handleSelectNote(notes[0]);
    }
    // If the selected note is deleted from another client
    if(selectedNote && notes && !notes.some(n => n.id === selectedNote.id)) {
      setSelectedNote(notes[0] || null);
    }
  }, [notes, selectedNote, handleSelectNote]);

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
        <div className="flex flex-1 min-h-0">
            {/* Notes List Pane */}
            <div className={`w-1/3 min-w-0 border-r flex flex-col group-data-[collapsible=icon]:hidden ${activeView ? 'hidden sm:flex' : 'w-full'}`}>
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
            <SidebarFooter className="p-2 border-t">
                <Button onClick={handleNewNoteClick} className="w-full" disabled={isCreating}>
                <Plus className="mr-2 h-4 w-4" /> New Note
                </Button>
            </SidebarFooter>
            </div>

            {/* Editor Pane */}
            <div className={`flex-1 min-w-0 group-data-[collapsible=icon]:hidden ${activeView ? 'flex' : 'hidden sm:flex'}`}>
            {activeView ? (
                <div className="flex flex-col h-full w-full">
                <div className="p-2 border-b flex items-center gap-2 justify-between">
                    <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg font-bold border-none focus-visible:ring-0 shadow-none flex-1"
                    placeholder="Note Title"
                    disabled={isCreating}
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
                <div className="flex-1 overflow-y-auto">
                    <Textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full border-none resize-none focus-visible:ring-0 shadow-none text-base p-4 overflow-hidden"
                    placeholder="Start writing..."
                    disabled={isCreating}
                    rows={1}
                    />
                </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <FilePen className="h-16 w-16 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">Select a note or create one</h3>
                <p className="text-sm text-muted-foreground">Your personal space for thoughts and ideas.</p>
                </div>
            )}
            </div>
        </div>
    </div>
  );
}
