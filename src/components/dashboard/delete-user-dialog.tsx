
'use client';

import { useTransition } from 'react';
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
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { deleteUser } from '@/lib/actions';
import type { MockUser } from '@/lib/types';

export function DeleteUserDialog({ userToDelete, onUserDeleted }: { userToDelete: MockUser, onUserDeleted: () => void }) {
    const { user: currentUser } = useAuth();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    if (!currentUser || currentUser.uid === userToDelete.uid) {
        return null;
    }

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteUser(userToDelete.uid);
            if (result.success) {
                toast({ title: "Sukses", description: `Pengguna ${userToDelete.displayName} telah dihapus.` });
                // onUserDeleted will be handled by real-time subscription
            } else {
                toast({ variant: "destructive", title: "Gagal", description: result.message });
            }
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tindakan ini akan menghapus pengguna <strong>{userToDelete.displayName}</strong> secara permanen. Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Ya, Hapus Pengguna
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
