
'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Loader2, Shield, User as UserIcon, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { MockUser } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert } from 'lucide-react';
import { getUsers, deleteUser } from '@/lib/actions';
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
import { useAuth } from '@/context/auth-context';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { LoadingScreen } from '@/components/loading-screen';

function DeleteUserDialog({ userToDelete, onUserDeleted }: { userToDelete: MockUser, onUserDeleted: () => void }) {
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

export function UsersTable() {
    const [users, setUsers] = useState<MockUser[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<MockUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const supabase = createClient();


    const loadUsers = async () => {
        setError(null);
        try {
            const result = await getUsers();
            if (result.success && result.data) {
                setUsers(result.data);
                setFilteredUsers(result.data); // Also update filtered users initially
            } else {
                setError(result.message);
            }
        } catch (e: any) {
            setError(e.message || "Gagal memuat pengguna.");
        } finally {
            setIsLoading(false);
        }
    }
    
    useEffect(() => {
        loadUsers();

        const channel = supabase.channel('profiles-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, loadUsers)
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        }
    }, [supabase]);

    useEffect(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        const filteredData = users.filter(item => {
            return (
                item.displayName.toLowerCase().includes(lowercasedFilter) ||
                (item.email && item.email.toLowerCase().includes(lowercasedFilter)) ||
                item.username.toLowerCase().includes(lowercasedFilter)
            );
        });
        setFilteredUsers(filteredData);
    }, [searchTerm, users]);

    if (isLoading) {
        return <LoadingScreen message="Memuat Pengguna..." />;
    }
    
    if (error) {
         return (
             <Alert variant="destructive">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Gagal Memuat Data</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
         )
    }

    return (
       <>
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Cari pengguna berdasarkan nama, email, atau username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
            />
        </div>
        <Card>
            <div className="hidden md:block">
                 <div className="overflow-auto scrollbar-hide">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Pengguna</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.uid}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName} />
                                                    <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{user.displayName}</div>
                                                    <div className="text-sm text-muted-foreground">@{user.username}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                {user.role === 'admin' ? <Shield className="mr-1 h-3 w-3" /> : <UserIcon className="mr-1 h-3 w-3" />}
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                           <DeleteUserDialog userToDelete={user} onUserDeleted={loadUsers} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-10">
                                        Tidak ada pengguna ditemukan.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <div className="grid gap-4 md:hidden p-4">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <Card key={user.uid} className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName} />
                                        <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold">{user.displayName}</p>
                                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                        {user.role === 'admin' ? <Shield className="mr-1 h-3 w-3" /> : <UserIcon className="mr-1 h-3 w-3" />}
                                        {user.role}
                                    </Badge>
                                    <DeleteUserDialog userToDelete={user} onUserDeleted={loadUsers} />
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-10">
                        Tidak ada pengguna ditemukan.
                    </div>
                )}
            </div>
        </Card>
       </>
    );
}
