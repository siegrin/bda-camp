
'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Download, Loader2, FileClock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { ActivityLog } from '@/lib/types';
import { getActivityLogs } from '@/lib/products';
import { getBackupData, resetActivityLog } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
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
import { createClient } from '@/lib/supabase/client';
import { LoadingScreen } from '@/components/loading-screen';


function ActionButtons({ onActionComplete }: { onActionComplete: () => void }) {
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
                // onActionComplete will be triggered by the real-time subscription
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


export default function LogsPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    async function loadData() {
        const loadedLogs = await getActivityLogs();
        setLogs(loadedLogs);
        setIsLoading(false);
    }

    useEffect(() => {
        loadData();

        const channel = supabase.channel('activity-log-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_log' }, loadData)
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);
    
    if (isLoading) {
        return <LoadingScreen message="Memuat Log Aktivitas..." />;
    }

    const getActionBadgeVariant = (action: string) => {
        if (action.includes('Tambah')) return 'default';
        if (action.includes('Ubah') || action.includes('Backup') || action.includes('Selesaikan')) return 'secondary';
        if (action.includes('Hapus') || action.includes('Reset')) return 'destructive';
        return 'outline';
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                 <div>
                    <h1 className="text-lg font-semibold md:text-2xl">Log Aktivitas & Backup</h1>
                    <p className="text-sm text-muted-foreground">
                        Tinjau aktivitas terbaru dan kelola backup data Anda.
                    </p>
                </div>
                <ActionButtons onActionComplete={loadData} />
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <FileClock className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Log Aktivitas Terbaru</CardTitle>
                    </div>
                    <CardDescription>Menampilkan 100 aktivitas terakhir yang tercatat di sistem.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="overflow-auto scrollbar-hide">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[200px]">Waktu</TableHead>
                                    <TableHead className="w-[150px]">Aksi</TableHead>
                                    <TableHead>Detail Aktivitas</TableHead>
                                    <TableHead className="w-[150px] hidden sm:table-cell">Pengguna</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.length > 0 ? (
                                    logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {format(new Date(log.timestamp), "d MMM yyyy, HH:mm:ss", { locale: id })}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getActionBadgeVariant(log.action)}>{log.action}</Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">{log.details}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">{log.user_name}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-10">
                                            Tidak ada log aktivitas ditemukan.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
