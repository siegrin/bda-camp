
'use client';

import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield, User as UserIcon } from 'lucide-react';
import type { MockUser } from '@/lib/types';
import { DeleteUserDialog } from './delete-user-dialog';

export function UserTableRow({ user, onUserDeleted }: { user: MockUser, onUserDeleted: () => void }) {
    return (
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
                <DeleteUserDialog userToDelete={user} onUserDeleted={onUserDeleted} />
            </TableCell>
        </TableRow>
    );
}
