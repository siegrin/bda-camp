
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { MockUser } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert } from 'lucide-react';
import { getUsers } from '@/lib/actions';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { LoadingScreen } from '@/components/loading-screen';
import { UserTableRow } from '@/components/dashboard/user-table-row';
import { UserCard } from '@/components/dashboard/user-card';


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
                                    <UserTableRow key={user.uid} user={user} onUserDeleted={loadUsers} />
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
                        <UserCard key={user.uid} user={user} onUserDeleted={loadUsers} />
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
