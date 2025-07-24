
'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getBackupData, resetActivityLog } from '@/lib/actions';
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

export function LogActions() {
    const { toast } = useToast();
    const [backupPending, startBackupTransition] = useTransition();
    const [resetPending, startResetTransition] = useTransition();

    const handleBackup = () => {
        startBackupTransition(async () => {
            const result = await getBackupData();
            if (result.success && result.data) {
                try {
                    const jsonString = JSON.stringify(result.data, null, 2);
                    const blob = new Blob([jsonString], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `bdacamp_backup_${new Date().toISOString()}.json`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    toast({ title: "Sukses!", description: "Data backup berhasil diunduh." });
                } catch (e) {
                     toast({ variant: "destructive", title: "Gagal", description: "Gagal membuat file backup." });
                }
            } else {
                toast({ variant: "destructive", title: "Gagal", description: result.message });
            }
        });
    };

    const handleReset = () => {
        startResetTransition(async () => {
            const result = await resetActivityLog();
            if (result.success) {
                toast({ title: "Sukses!", description: result.message });
                // UI will update via real-time subscription
            } else {
                toast({ variant: "destructive", title: "Gagal", description: result.message });
            }
        });
    };

    return (
        <div className="flex gap-2">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                     <Button variant="outline" disabled={resetPending}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Reset Log
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini akan menghapus semua log aktivitas secara permanen. Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleReset} disabled={resetPending} className="bg-destructive hover:bg-destructive/90">
                             {resetPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             Ya, Hapus Log
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Button onClick={handleBackup} disabled={backupPending}>
                {backupPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Download className="mr-2 h-4 w-4" />
                )}
                Buat Backup Data
            </Button>
        </div>
    );
}
