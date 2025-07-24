
'use client';

import type { Rental, RentalStatus } from '@/lib/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { RentalActionButtons } from './rental-action-buttons';
import { Package } from 'lucide-react';

export function RentalCard({ rental }: { rental: Rental }) {
  const checkoutDate = new Date(rental.checkout_date);
  const formattedDate = format(checkoutDate, "d MMM yyyy, HH:mm", { locale: id });
  
  const statusVariants: { [key in RentalStatus]: string } = {
    pending: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 dark:text-yellow-400',
    active: 'bg-blue-500/20 text-blue-700 border-blue-500/30 dark:text-blue-400',
    completed: 'bg-green-500/20 text-green-700 border-green-500/30 dark:text-green-400',
    cancelled: 'bg-red-500/20 text-red-700 border-red-500/30 dark:text-red-400',
  }
  
  const statusText: { [key in RentalStatus]: string } = {
      pending: 'Tertunda',
      active: 'Aktif',
      completed: 'Selesai',
      cancelled: 'Dibatalkan'
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                 <CardTitle className="text-xl">{rental.user_name}</CardTitle>
                 <CardDescription>{formattedDate}</CardDescription>
            </div>
            <Badge variant="outline" className={cn("capitalize", statusVariants[rental.status])}>
                {statusText[rental.status]}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow">
        <Accordion type="single" collapsible className="flex-grow">
            <AccordionItem value="items">
                <AccordionTrigger className="font-semibold text-base">
                    <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>Lihat Item ({rental.items.length})</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                     <ul className="space-y-2 text-sm text-muted-foreground pt-2">
                        {rental.items.map(item => (
                            <li key={item.id} className="flex justify-between">
                                <span>{item.name} <span className="text-xs">({item.quantity}x, {item.days} hari)</span></span>
                                <span>{formatPrice(item.price_per_day * item.days * item.quantity)}</span>
                            </li>
                        ))}
                         <li className="flex justify-between font-bold text-foreground border-t pt-2 mt-2">
                            <span>Total</span>
                            <span>{formatPrice(rental.total)}</span>
                        </li>
                    </ul>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
        <RentalActionButtons rental={rental} />
      </CardContent>
    </Card>
  )
}
