
'use client';

import { useState, useEffect, useTransition, ChangeEvent } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Settings, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSettings, updateSettings } from '@/lib/actions';
import type { SiteSettings } from '@/lib/types';
import { LogoIcon } from '@/components/icons';
import { ImageCropperDialog } from '@/components/image-cropper-dialog';
import { LoadingScreen } from '@/components/loading-screen';

function LogoPreview({ logoUrl }: { logoUrl?: string | null }) {
  if (logoUrl) {
    return (
      <Image 
        src={logoUrl} 
        alt="Logo Preview" 
        width={100} 
        height={100} 
        className="h-24 w-24 object-contain rounded-md"
        unoptimized
      />
    );
  }
  
  return <LogoIcon className="h-20 w-20 text-muted-foreground/50" />;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    
    // State for logo editing
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoToCrop, setLogoToCrop] = useState<string | null>(null);
    const [isCropperOpen, setCropperOpen] = useState(false);
    const [croppedLogoFile, setCroppedLogoFile] = useState<File | null>(null);


    useEffect(() => {
        async function loadSettings() {
            setIsLoading(true);
            const currentSettings = await getSettings();
            setSettings(currentSettings);
            setLogoPreview(currentSettings.logo_url);
            setIsLoading(false);
        }
        loadSettings();
    }, []);
    
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    setLogoToCrop(reader.result);
                    setCropperOpen(true);
                }
            };
            reader.readAsDataURL(file);
            e.target.value = ''; // Reset input so the same file can be chosen again
        }
    };

    const handleCropComplete = (newCroppedLogo: string) => {
        setLogoPreview(newCroppedLogo); // Update preview immediately
        fetch(newCroppedLogo)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], "logo.png", { type: "image/png" });
            setCroppedLogoFile(file);
          });
        setCropperOpen(false);
    };


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!settings) return;

        startTransition(async () => {
            const formData = new FormData(event.currentTarget);
            if (croppedLogoFile) {
                formData.append('logo_new', croppedLogoFile);
            }
            formData.append('logo_url_existing', logoPreview || '');
            
            const result = await updateSettings(formData);
            if (result.success) {
                toast({ title: "Sukses!", description: "Pengaturan berhasil diperbarui." });
            } else {
                toast({ variant: "destructive", title: "Gagal", description: result.message });
            }
        });
    };

    if (isLoading || !settings) {
        return <LoadingScreen message="Memuat Pengaturan..." />;
    }

    return (
        <div className="flex flex-col gap-4">
            <div>
                <h1 className="text-lg font-semibold md:text-2xl flex items-center gap-2">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    Pengaturan Situs
                </h1>
                <p className="text-sm text-muted-foreground">
                    Kelola informasi kontak, media sosial, dan logo situs Anda.
                </p>
            </div>
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Logo Situs</CardTitle>
                        <CardDescription>Unggah dan potong logo untuk ditampilkan di header.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Pratinjau Logo</Label>
                            <div className="w-24 h-24 rounded-lg border flex items-center justify-center bg-muted/50 p-1">
                                <LogoPreview logoUrl={logoPreview} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label 
                                htmlFor="logo-upload" 
                                className="inline-block cursor-pointer rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
                            >
                                Ganti Logo
                            </Label>
                             <Input
                                id="logo-upload"
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                className="sr-only"
                                onChange={handleFileChange}
                                disabled={isPending}
                            />
                            <p className="text-xs text-muted-foreground">Rekomendasi ukuran persegi (1:1).</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle>Informasi Kontak & Pembayaran</CardTitle>
                        <CardDescription>Detail ini akan ditampilkan di footer dan digunakan untuk proses pembayaran via WhatsApp.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="whatsappNumber">Nomor WhatsApp</Label>
                            <Input id="whatsapp_number" name="whatsapp_number" defaultValue={settings.whatsapp_number} placeholder="cth: 6281234567890" />
                            <p className="text-xs text-muted-foreground">Gunakan format internasional tanpa '+', spasi, atau '-'.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" defaultValue={settings.email} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telepon (Tampilan)</Label>
                            <Input id="phone" name="phone" defaultValue={settings.phone} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Alamat</Label>
                            <Input id="address" name="address" defaultValue={settings.address} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle>Media Sosial</CardTitle>
                        <CardDescription>Masukkan URL lengkap untuk setiap profil media sosial.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="twitter">Twitter URL</Label>
                            <Input id="twitter" name="social_twitter" type="url" defaultValue={settings.social.twitter} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="facebook">Facebook URL</Label>
                            <Input id="facebook" name="social_facebook" type="url" defaultValue={settings.social.facebook} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="instagram">Instagram URL</Label>
                            <Input id="instagram" name="social_instagram" type="url" defaultValue={settings.social.instagram} />
                        </div>
                    </CardContent>
                </Card>
                <div className="mt-6 flex justify-end">
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Simpan Perubahan
                    </Button>
                </div>
            </form>
            
             <ImageCropperDialog
                isOpen={isCropperOpen}
                onOpenChange={setCropperOpen}
                imageSrc={logoToCrop}
                onCropComplete={handleCropComplete}
                aspectRatio={1}
                description="Rekomendasi ukuran persegi (1:1)."
            />
        </div>
    );
}
