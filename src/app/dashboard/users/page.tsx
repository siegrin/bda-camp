
import { UsersTable } from './users-table';
import { Users } from 'lucide-react';


export default function UsersPage() {
    return (
        <div className="flex flex-col gap-4">
            <div>
                <h1 className="text-lg font-semibold md:text-2xl flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    Manajemen Pengguna
                </h1>
                <p className="text-sm text-muted-foreground">
                    Lihat, cari, dan hapus pengguna yang terdaftar di sistem.
                </p>
            </div>
            
            <UsersTable />
        </div>
    );
}
