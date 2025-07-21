
'use client';

import { useTransition } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { subscribeToNewsletter } from '@/lib/actions';
import { useToast } from "@/hooks/use-toast";

export function NewsletterForm() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const form = event.currentTarget;

      startTransition(async () => {
          const result = await subscribeToNewsletter(formData);
          if (result.success) {
              toast({ title: "Berhasil!", description: result.message });
              form.reset();
          } else {
              toast({ variant: "destructive", title: "Gagal", description: result.message });
          }
      });
  }

  return (
      <form className="mt-2 flex gap-2" onSubmit={handleSubmit}>
         <div className="honeypot">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" tabIndex={-1} autoComplete="off" />
          </div>
          <Input type="email" name="email" placeholder="Email Anda" required disabled={isPending} />
          <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? 'Mengirim...' : 'Berlangganan'}
          </Button>
      </form>
  )
}
