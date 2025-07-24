
'use client';

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield, User as UserIcon } from 'lucide-react';
import type { MockUser } from '@/lib/types';
import { DeleteUserDialog } from './delete-user-dialog';

export function UserCard({ user, onUserDeleted }: { user: MockUser, onUserDeleted: () => void }) {
    return (
        <Card className="p-4">
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
                    <DeleteUserDialog userToDelete={user} onUserDeleted={onUserDeleted} />
                </div>
            </div>
        </Card>
    );
}
