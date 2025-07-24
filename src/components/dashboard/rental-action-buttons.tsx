
'use client';

import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { completeRental, activateRental, cancelRental } from '@/lib/actions';
import type { Rental } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, PlayCircle, XCircle } from 'lucide-react';

export function RentalActionButtons({ rental }: { rental: Rental }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleAction = async (action: () => Promise<any>) => {
        startTransition(async () => {
            const result = await action();
            if (result.success) {
                toast({ title: "Sukses!", description: result.message });
                // Real-time subscription will update the UI
            } else {
                toast({ variant: "destructive", title: "Gagal", description: result.message });
            }
        });
    }

    return (
        <div className="mt-4 flex justify-end gap-2 pt-4 border-t">
            {rental.status === 'pending' && (
                <>
                    <Button onClick={() => handleAction(() => cancelRental(rental.id))} disabled={isPending} size="sm" variant="destructive">
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                        Batalkan
                    </Button>
                    <Button onClick={() => handleAction(() => activateRental(rental.id))} disabled={isPending} size="sm">
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
                        Aktifkan
                    </Button>
                </>
            )}
            {rental.status === 'active' && (
                <Button onClick={() => handleAction(() => completeRental(rental.id))} disabled={isPending} size="sm">
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                    Tandai Selesai
                </Button>
            )}
        </div>
    )
}
