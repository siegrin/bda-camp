
'use client';

import { useState, useEffect, useTransition, ChangeEvent } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Settings, Save, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSettings, updateSettings } from '@/lib/actions';
import type { SiteSettings } from '@/lib/types';
import { LogoIcon } from '@/components/icons';
import { LoadingScreen } from '@/components/loading-screen';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/logo';


export default function SettingsPage() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    
    // State for logo editing
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoSvgContent, setLogoSvgContent] = useState<string | null>(null);
    const [logoImageFile, setLogoImageFile] = useState<File | null>(null);


    useEffect(() => {
        async function loadSettings() {
            setIsLoading(true);
            const currentSettings = await getSettings();
            setSettings(currentSettings);
            setLogoPreview(currentSettings.logo_url);
            setLogoSvgContent(currentSettings.logo_svg_content);
            setIsLoading(false);
        }
        loadSettings();
    }, []);
    
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];

            // Reset states
            setLogoImageFile(null);
            setLogoSvgContent(null);
            setLogoPreview(null);
            
            if (file.type === "image/svg+xml") {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setLogoSvgContent(reader.result as string);
                };
                reader.readAsText(file);
            } else {
                setLogoImageFile(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setLogoPreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            }
             e.target.value = ''; // Reset input so the same file can be chosen again
        }
    };


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!settings) return;

        startTransition(async () => {
            const formData = new FormData(event.currentTarget);
            
            if (logoImageFile) {
                formData.append('logo_new', logoImageFile);
            }
            if (logoSvgContent) {
                formData.append('logo_svg_content', logoSvgContent);
            }
            
            const result = await updateSettings(formData);
            if (result.success) {
                toast({ title: "Sukses!", description: "Pengaturan berhasil diperbarui." });
                if (result.data) {
                    setLogoImageFile(null);
                    setLogoPreview(result.data.logo_url);
                    setLogoSvgContent(result.data.logo_svg_content);
                }
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
                        <CardDescription>Unggah logo (SVG untuk warna dinamis, atau PNG/JPG untuk gambar statis).</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                            <div>
                                <Label>Pratinjau Logo</Label>
                                <div className="mt-2 w-32 h-32 rounded-lg border flex items-center justify-center bg-muted/50 p-2">
                                     <AnimatePresence mode="wait">
                                        <motion.div
                                            key={logoPreview || logoSvgContent || 'default'}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Logo className="h-24 w-24 text-primary" logoUrl={logoPreview} logoSvgContent={logoSvgContent} />
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label 
                                    htmlFor="logo-upload" 
                                >
                                    <div className={cn(
                                        "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer",
                                        "hover:border-primary hover:bg-accent transition-colors"
                                    )}>
                                        <UploadCloud className="h-8 w-8 text-muted-foreground" />
                                        <span className="text-sm font-semibold mt-1">Ganti Logo</span>
                                        <span className="text-xs text-muted-foreground">SVG, PNG, JPG</span>
                                    </div>
                                </Label>
                                 <Input
                                    id="logo-upload"
                                    type="file"
                                    accept="image/png, image/jpeg, image/webp, image/svg+xml"
                                    className="sr-only"
                                    onChange={handleFileChange}
                                    disabled={isPending}
                                />
                            </div>
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
        </div>
    );
}
