
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AreaChart } from "lucide-react";

export default function ReportsPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard');
    }, [router]);

    return (
        <div className="flex flex-col gap-4">
             <div>
                <h1 className="text-lg font-semibold md:text-2xl flex items-center gap-2">
                    <AreaChart className="h-5 w-5 text-muted-foreground" />
                    Mengarahkan...
                </h1>
                <p className="text-sm text-muted-foreground">
                    Fitur laporan kini menjadi bagian dari halaman Overview.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Halaman Dipindahkan</CardTitle>
                    <CardDescription>
                        Anda sedang diarahkan ke halaman Overview.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}
