
'use client';

import { useState, useTransition, ChangeEvent, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile } from '@/lib/actions';
import { createClient } from '@/lib/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImageCropperDialog } from '@/components/image-cropper-dialog';
import { useDebounce } from 'use-debounce';

const validateUsername = (username: string): string => {
    if (username.length < 3) return "Username minimal 3 karakter.";
    if (username.length > 20) return "Username maksimal 20 karakter.";
    if (/\s/.test(username)) return "Username tidak boleh mengandung spasi.";
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Username hanya boleh berisi huruf, angka, dan garis bawah (_).";
    return "";
};

function AvailabilityStatus({ status, message }: { status: 'checking' | 'available' | 'unavailable' | 'idle' | 'error', message: string }) {
    if (status === 'idle') return null;
    const baseClasses = "flex items-center gap-1.5 text-xs mt-1.5";
    if (status === 'checking') {
        return <div className={baseClasses + " text-muted-foreground"}><Loader2 className="h-3 w-3 animate-spin"/> Memeriksa...</div>
    }
    if (status === 'available') {
        return <div className={baseClasses + " text-green-600"}><CheckCircle className="h-3 w-3"/> Tersedia</div>
    }
    if (status === 'unavailable' || status === 'error') {
        return <div className={baseClasses + " text-destructive"}><XCircle className="h-3 w-3"/> {message}</div>
    }
    return null;
}


export default function ProfileSettingsPage() {
  const { user, updateUserClient, loading } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();

  const [isProfilePending, startProfileTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState(user?.username || '');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // State for profile picture
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.photoURL || null);
  const [avatarToCrop, setAvatarToCrop] = useState<string | null>(null);
  const [isCropperOpen, setCropperOpen] = useState(false);
  const [croppedAvatarFile, setCroppedAvatarFile] = useState<File | null>(null);

  // State for username validation
  const [debouncedUsername] = useDebounce(username, 500);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable' | 'error'>('idle');
  const [usernameError, setUsernameError] = useState('');

  useEffect(() => {
    if (user) {
        setDisplayName(user.displayName);
        setUsername(user.username);
        setAvatarPreview(user.photoURL || null);
    }
  }, [user]);

  const checkUsernameAvailability = useCallback(async (name: string) => {
    if (!user || name === user.username) {
        setUsernameStatus('idle');
        return;
    }
    const validationError = validateUsername(name);
    setUsernameError(validationError);
    if (validationError) {
        setUsernameStatus('unavailable');
        return;
    }

    setUsernameStatus('checking');
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('username')
            .eq('username', name.toLowerCase())
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        setUsernameStatus(data ? 'unavailable' : 'available');
    } catch (error) {
        setUsernameStatus('error');
        console.error("Error checking username", error);
    }
  }, [supabase, user]);

  useEffect(() => {
      checkUsernameAvailability(debouncedUsername);
  }, [debouncedUsername, checkUsernameAvailability]);


  const isProfileFormUnchanged = useMemo(() => {
      if (!user) return true;
      return displayName === user.displayName && 
             username === user.username &&
             !croppedAvatarFile;
  }, [user, displayName, username, croppedAvatarFile]);

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    startProfileTransition(async () => {
      const formData = new FormData();
      formData.append('displayName', displayName);
      formData.append('username', username);
      if (croppedAvatarFile) {
          formData.append('avatar_new', croppedAvatarFile);
      }
      
      const result = await updateUserProfile(formData);

      if (result.success && result.data) {
        toast({ title: 'Sukses!', description: result.message });
        updateUserClient(result.data);
        setCroppedAvatarFile(null); // Reset file after successful upload
      } else {
        toast({ variant: 'destructive', title: 'Gagal', description: result.message });
      }
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                setAvatarToCrop(reader.result);
                setCropperOpen(true);
            }
        };
        reader.readAsDataURL(file);
        e.target.value = ''; // Reset input so the same file can be chosen again
    }
  };
  
  const handleCropComplete = (newCroppedAvatar: string) => {
    setAvatarPreview(newCroppedAvatar);
    fetch(newCroppedAvatar)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "avatar.png", { type: "image/png" });
        setCroppedAvatarFile(file);
      });
    setCropperOpen(false);
  };

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword.includes(' ')) {
      setPasswordError("Kata sandi baru tidak boleh mengandung spasi.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Kata sandi baru tidak cocok.');
      return;
    }
    if (newPassword.length < 6) {
        setPasswordError('Kata sandi baru harus minimal 6 karakter.');
        return;
    }
    setPasswordError('');
    startPasswordTransition(async () => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        toast({ variant: 'destructive', title: 'Gagal', description: `Gagal mengubah kata sandi: ${error.message}` });
      } else {
        toast({ title: 'Sukses!', description: 'Kata sandi berhasil diubah.' });
        setNewPassword('');
        setConfirmPassword('');
      }
    });
  };

  if (loading || !user) return null;

  return (
    <>
    <div className="container mx-auto max-w-4xl py-8 md:py-12">
      <div className="mb-6">
        <h1 className="font-headline text-3xl font-bold md:text-4xl">Pengaturan Akun</h1>
        <p className="text-muted-foreground">Kelola informasi profil dan keamanan Anda.</p>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Profil</CardTitle>
            <CardDescription>Informasi ini akan ditampilkan secara publik di situs.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
               <div className="space-y-2">
                    <Label>Foto Profil</Label>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={avatarPreview || undefined} alt={user.displayName} />
                            <AvatarFallback className="text-2xl">{user.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Button type="button" variant="outline" onClick={() => document.getElementById('avatar-upload')?.click()}>
                            Ganti Foto
                        </Button>
                        <Input 
                            id="avatar-upload" 
                            type="file" 
                            className="sr-only" 
                            accept="image/png, image/jpeg, image/webp" 
                            onChange={handleFileChange}
                            disabled={isProfilePending}
                        />
                    </div>
                </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Nama Lengkap</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isProfilePending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                    id="username" 
                    name="username"
                    value={username} 
                    onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))} 
                    disabled={isProfilePending}
                />
                 <AvailabilityStatus status={usernameStatus} message={usernameError || 'Username ini sudah digunakan'} />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isProfilePending || isProfileFormUnchanged || usernameStatus === 'unavailable'}>
                  {isProfilePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan Perubahan Profil
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ubah Kata Sandi</CardTitle>
            <CardDescription>Pastikan untuk menggunakan kata sandi yang kuat.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Kata Sandi Baru</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isPasswordPending}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi Baru</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isPasswordPending}
                  required
                />
              </div>
              {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
              <div className="flex justify-end">
                <Button type="submit" disabled={isPasswordPending || !newPassword}>
                  {isPasswordPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Ubah Kata Sandi
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
    <ImageCropperDialog
        isOpen={isCropperOpen}
        onOpenChange={setCropperOpen}
        imageSrc={avatarToCrop}
        onCropComplete={handleCropComplete}
        aspectRatio={1}
        description="Potong foto profil Anda menjadi bentuk persegi."
    />
    </>
  );
}

    
