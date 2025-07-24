
'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { resetRentals } from '@/lib/actions';
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

export function RentalResetButton() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleReset = () => {
        startTransition(async () => {
            const result = await resetRentals();
            if (result.success) {
                toast({ title: "Sukses!", description: result.message });
                // UI will update via real-time subscription
            } else {
                toast({ variant: "destructive", title: "Gagal", description: result.message });
            }
        });
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={isPending}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Reset Data
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tindakan ini akan menghapus semua data penyewaan (aktif dan selesai) secara permanen.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Ya, Hapus Data
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
