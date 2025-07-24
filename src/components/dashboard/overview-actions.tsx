
'use client';

import { useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { resetAnalyticsData, getReportData } from '@/lib/actions';

export function OverviewActions({ onReset }: { onReset: () => void }) {
    const { toast } = useToast();
    const [isResetting, startResetTransition] = useTransition();
    const [isDownloading, startDownloadTransition] = useTransition();

    const handleReset = () => {
        startResetTransition(async () => {
            const result = await resetAnalyticsData();
            if (result.success) {
                toast({ title: "Sukses!", description: result.message });
                onReset();
            } else {
                toast({ variant: "destructive", title: "Gagal", description: result.message });
            }
        });
    };
    
    const handleDownloadReport = () => {
        startDownloadTransition(async () => {
            const result = await getReportData();
            if (result.success && result.data) {
                try {
                    const byteCharacters = atob(result.data);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });

                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `bdacamp_report_${new Date().toISOString().split('T')[0]}.docx`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    toast({ title: "Sukses!", description: "Laporan berhasil diunduh." });
                } catch (e) {
                     toast({ variant: "destructive", title: "Gagal", description: "Gagal membuat file laporan Word." });
                }
            } else {
                toast({ variant: "destructive", title: "Gagal", description: result.message || "Tidak dapat mengambil data laporan." });
            }
        });
    };

    return (
        <div className="flex items-center gap-2">
            <Button onClick={handleReset} disabled={isResetting} variant="outline" size="sm">
                {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Reset Data
            </Button>
            <Button onClick={handleDownloadReport} disabled={isDownloading} variant="outline" size="sm">
                {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Unduh Laporan
            </Button>
        </div>
    );
}
