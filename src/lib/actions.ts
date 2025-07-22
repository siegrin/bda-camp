
'use server';

import type { Product, Category, Subcategory, ActivityLog, MockUser, SiteSettings, AnalyticsData, Rental, RentalStatus, CartItem, ReportData } from './types';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { format, subMonths } from 'date-fns';
import { id } from 'date-fns/locale';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, VerticalAlign,BorderStyle } from 'docx';
import { formatPrice } from './utils';


// --- START: Rate Limiting ---
const rateLimitMap = new Map<string, { count: number, timestamp: number }>();

function rateLimit(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record || now - record.timestamp > windowMs) {
        rateLimitMap.set(key, { count: 1, timestamp: now });
        return false; // Not rate limited
    }

    record.count++;
    if (record.count > limit) {
        return true; // Rate limited
    }

    return false; // Not rate limited
}

function getIp() {
    const forwardedFor = headers().get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0];
    }
    return headers().get('x-real-ip') || '127.0.0.1';
}

// Clean up old entries periodically to prevent memory leaks in a long-running server
setInterval(() => {
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour
    for (const [key, record] of rateLimitMap.entries()) {
        if (now - record.timestamp > windowMs) {
            rateLimitMap.delete(key);
        }
    }
}, 60 * 60 * 1000);
// --- END: Rate Limiting ---


// This function should not be used directly in Server Components
// as it relies on cookies(). Instead, use the one from middleware or route handlers.
function createClientForActions() {
    const cookieStore = cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get: (name) => cookieStore.get(name)?.value,
                set: (name, value, options) => {
                    try { cookieStore.set({ name, value, ...options }); } catch (error) {}
                },
                remove: (name, options) => {
                    try { cookieStore.set({ name, value: '', ...options }); } catch (error) {}
                },
            },
        }
    );
}

async function getCurrentUser() {
    const supabase = createClientForActions();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
    if (!profile) return null;

    return {
        uid: profile.id,
        username: profile.username || '', 
        displayName: profile.display_name || user.email || '',
        role: profile.role as 'admin' | 'user',
        email: user.email || null, 
        photoURL: profile.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
    };
}


export const registerUser = async (email: string, pass: string, displayName: string, username: string) => {
    'use server';
    const ip = getIp();
    if (rateLimit(`register:${ip}`, 5, 60 * 1000 * 5)) { // 5 requests per 5 minutes
        return { success: false, message: 'Terlalu banyak percobaan. Harap tunggu beberapa saat.' };
    }

    const supabaseAdmin = createSupabaseAdminClient();
    
    // Call signUp with Supabase Admin to bypass email verification if needed
    // or use the regular client if verification is desired.
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: pass,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
            display_name: displayName,
            username: username.toLowerCase().trim(),
            avatar_url: null,
        }
    });

    if (error) {
        console.error("Auth error on registration:", error);
        return { success: false, message: `Pendaftaran gagal: ${error.message}` };
    }
    
    if (!data.user) {
        return { success: false, message: 'Pendaftaran gagal: Tidak ada data pengguna yang dikembalikan.' };
    }
    
    // The trigger should handle profile creation, but we can double-check.
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ 
            display_name: displayName,
            username: username.toLowerCase().trim()
        })
        .eq('id', data.user.id);

    if (profileError) {
         console.error("Profile update error on registration:", profileError);
         // Don't fail the whole registration for this, but log it.
    }


    return {
        success: true,
        message: 'Registrasi berhasil. Anda sekarang dapat login.',
    };
};


type UserAction<T extends any[], R> = (...args: T) => Promise<{ success: boolean; message: string; data?: R }>;

function userAction<T extends any[], R>(action: (user: MockUser, ...args: T) => Promise<{ success: boolean; message: string; data?: R; }>): UserAction<T, R> {
  return async (...args: T) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('Unauthorized: Anda harus login.');
      }
      return await action(user, ...args);
    } catch (error: any) {
      console.error("Action failed:", error.message);
      return { success: false, message: error.message || 'An unknown error occurred.' };
    }
  };
}


type AdminAction<T extends any[], R> = (...args: T) => Promise<{ success: boolean; message: string; data?: R }>;

function adminAction<T extends any[], R>(action: (user: MockUser, ...args: T) => Promise<{ success: boolean; message: string; data?: R; }>): AdminAction<T, R> {
  return async (...args: T) => {
    try {
      const user = await getCurrentUser();
      if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required.');
      }
      return await action(user, ...args);
    } catch (error: any) {
      console.error("Action failed:", error.message);
      return { success: false, message: error.message || 'An unknown error occurred.' };
    }
  };
}

async function logActivity(action: string, details: string, user?: MockUser | null) {
    const supabase = createSupabaseAdminClient();
    const currentUser = user || await getCurrentUser();
    const { error } = await supabase
        .from('activity_log')
        .insert({
            user_name: currentUser?.displayName || 'Pengunjung',
            action,
            details,
        });

    if (error) console.error("Error logging activity:", error.message);
}

const ProductSchema = z.object({
    name: z.string().min(3, { message: 'Nama produk harus lebih dari 3 karakter.' }),
    price_per_day: z.coerce.number().positive({ message: 'Harga harus angka positif.' }),
    stock: z.coerce.number().min(0, { message: 'Stok tidak boleh negatif.' }),
    category_id: z.coerce.number().positive({ message: 'Kategori harus dipilih.' }),
    subcategory_id: z.coerce.number().positive({ message: 'Subkategori harus diisi.' }),
    description: z.string().min(10, { message: 'Deskripsi harus lebih dari 10 karakter.' }),
    availability: z.string(),
    data_ai_hint: z.string().optional(),
    object_fit: z.enum(['cover', 'contain']).optional(),
});

const CategorySchema = z.object({
    name: z.string().min(3, { message: 'Nama kategori harus lebih dari 3 karakter.' }),
});

const SubcategorySchema = z.object({
    name: z.string().min(3, { message: 'Nama subkategori harus diisi.' }),
    category_id: z.coerce.number({invalid_type_error: 'Induk kategori harus dipilih.'}),
});

const SettingsSchema = z.object({
    email: z.string().email({ message: "Format email tidak valid." }).or(z.literal("")),
    phone: z.string(),
    address: z.string(),
    whatsapp_number: z.string().regex(/^[0-9]+$/, { message: "Nomor WhatsApp hanya boleh berisi angka." }).min(10, { message: "Nomor WhatsApp terlalu pendek." }),
    social_twitter: z.string().url({ message: "URL Twitter tidak valid." }).or(z.literal("")).or(z.literal("#")),
    social_facebook: z.string().url({ message: "URL Facebook tidak valid." }).or(z.literal("")).or(z.literal("#")),
    social_instagram: z.string().url({ message: "URL Instagram tidak valid." }).or(z.literal("")).or(z.literal("#")),
});

const NewsletterSchema = z.object({
    email: z.string().email({ message: "Alamat email tidak valid." }),
    name: z.string().optional(), // Honeypot field
});

async function uploadImage(file: File, bucket: 'product-images' | 'site-assets', pathPrefix: string = ''): Promise<string> {
    const supabase = createSupabaseAdminClient();
    const filePath = `${pathPrefix}${Date.now()}-${file.name.replace(/\s/g, '-')}`;
    const { error } = await supabase.storage.from(bucket).upload(filePath, file);
    if (error) throw new Error(`Gagal mengunggah gambar: ${error.message}`);
    
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
}

async function parseAndSaveProductImages(data: FormData): Promise<{ images: string[]; specs: Record<string, string> }> {
    const images: string[] = [];
    const specs: Record<string, string> = {};
    const specMap = new Map<string, { name?: string; value?: string }>();

    for (const [key, value] of data.entries()) {
        if (key.startsWith('image_new_')) {
            if (value instanceof File && value.size > 0) {
                const publicUrl = await uploadImage(value, 'product-images');
                images.push(publicUrl);
            }
        } else if (key.startsWith('image_existing_') && typeof value === 'string') {
            images.push(value);
        } else if (key.startsWith('spec_name_')) {
            const index = key.split('_').pop()!;
            if (!specMap.has(index)) specMap.set(index, {});
            specMap.get(index)!.name = value as string;
        } else if (key.startsWith('spec_value_item_')) {
            const index = key.split('_').pop()!;
            if (!specMap.has(index)) specMap.set(index, {});
            specMap.get(index)!.value = value as string;
        }
    }
    
    for (const { name, value } of specMap.values()) {
        if (name && value) {
            specs[name] = value;
        }
    }

    return { images, specs };
}

export const addProduct = adminAction(async (user, data: FormData) => {
    const supabase = createSupabaseAdminClient();
    const formDataObj = Object.fromEntries(data.entries());
    const { images, specs } = await parseAndSaveProductImages(data);
    
    const validatedFields = ProductSchema.safeParse({ ...formDataObj });
    if (!validatedFields.success) {
        return { success: false, message: validatedFields.error.flatten().fieldErrors[Object.keys(validatedFields.error.flatten().fieldErrors)[0]]?.[0] || 'Data tidak valid.' };
    }

    const { name } = validatedFields.data;
    const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .ilike('name', name)
        .single();

    if (existingProduct) return { success: false, message: 'Nama produk sudah ada.' };
    
    const newProduct = {
        ...validatedFields.data,
        images: images,
        specs: specs,
    };
    
    const { error } = await supabase.from('products').insert(newProduct);
    if(error) return { success: false, message: `Gagal menambahkan produk: ${error.message}` };

    await logActivity('Tambah Produk', `Produk "${name}" telah ditambahkan.`, user);
    
    revalidatePath('/dashboard/products');
    revalidatePath('/equipment');
    revalidatePath('/');
    return { success: true, message: 'Produk berhasil ditambahkan.' };
});

export const updateProduct = adminAction(async (user, id: number, data: FormData) => {
    const supabase = createSupabaseAdminClient();
    const formDataObj = Object.fromEntries(data.entries());
    const { images, specs } = await parseAndSaveProductImages(data);
    
    const validatedFields = ProductSchema.partial().safeParse({ ...formDataObj });
    if (!validatedFields.success) {
        return { success: false, message: validatedFields.error.flatten().fieldErrors[Object.keys(validatedFields.error.flatten().fieldErrors)[0]]?.[0] || 'Data tidak valid.' };
    }

    const { error } = await supabase
        .from('products')
        .update({ ...validatedFields.data, images, specs })
        .eq('id', id);

    if (error) return { success: false, message: `Gagal memperbarui produk: ${error.message}` };

    await logActivity('Ubah Produk', `Produk dengan ID "${id}" telah diperbarui.`, user);
    
    revalidatePath('/dashboard/products');
    revalidatePath(`/equipment/${id}`);
    revalidatePath('/equipment');
    revalidatePath('/');
    return { success: true, message: 'Produk berhasil diperbarui.' };
});

export const deleteProduct = adminAction(async (user, id: number) => {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return { success: false, message: `Gagal menghapus produk: ${error.message}` };

    await logActivity('Hapus Produk', `Produk dengan ID "${id}" telah dihapus.`, user);
    
    revalidatePath('/dashboard/products');
    revalidatePath('/equipment');
    revalidatePath('/');
    return { success: true, message: 'Produk berhasil dihapus.' };
});

export const logRentalCheckout = userAction(async (user, cart: CartItem[]) => {
    const ip = getIp();
    if (rateLimit(`checkout:${user.uid}:${ip}`, 3, 60 * 1000 * 10)) { // 3 requests per 10 minutes
        return { success: false, message: 'Terlalu banyak percobaan. Harap tunggu beberapa saat.' };
    }

    const supabase = createClientForActions();
    const total = cart.reduce((acc, item) => acc + item.price_per_day * item.days * item.quantity, 0);

    const newRental: Omit<Rental, 'id' | 'checkout_date'> = {
        user_id: user.uid,
        user_name: user.displayName,
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            days: item.days,
            price_per_day: item.price_per_day,
            quantity: item.quantity,
        })),
        total,
        status: 'pending',
    };

    const { error } = await supabase.from('rentals').insert(newRental);
    if (error) return { success: false, message: `Gagal mencatat penyewaan: ${error.message}` };

    await logActivity('Checkout', `Pengguna "${user.displayName}" memulai penyewaan baru.`, user);
    
    revalidatePath('/dashboard/rentals');
    revalidatePath('/profile');
    return { success: true, message: 'Penyewaan berhasil dicatat.' };
});

export const logProductView = async (productId: number) => {
    try {
        const supabase = createClientForActions();
        const { data: product, error: pError } = await supabase.from('products').select('name').eq('id', productId).single();
        if (pError || !product) return { success: false, message: 'Produk tidak ditemukan.' };

        const { data, error } = await supabase.from('analytics').select('*').single();
        if (error) throw error;
        
        const analytics: AnalyticsData = data || { daily_visitors: [], top_products: [], weekly_summary: { total_revenue: 0, total_rentals: 0 } };

        // Update daily visitors
        const dayIndex = new Date().getDay();
        const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
        if (!analytics.daily_visitors[adjustedIndex]) {
             analytics.daily_visitors[adjustedIndex] = { day: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'][adjustedIndex], visitors: 0 };
        }
        analytics.daily_visitors[adjustedIndex].visitors = (analytics.daily_visitors[adjustedIndex].visitors || 0) + 1;

        // Update top products
        const topProductIndex = analytics.top_products.findIndex(p => p.name === product.name);
        if (topProductIndex > -1) {
            analytics.top_products[topProductIndex].rentals += 1;
        } else {
            analytics.top_products.push({ name: product.name, rentals: 1 });
        }
        analytics.top_products.sort((a, b) => b.rentals - a.rentals);
        if (analytics.top_products.length > 10) analytics.top_products.pop();
        
        await supabase.from('analytics').update(analytics).eq('id', 1);
        await logActivity('Lihat Produk', `Produk "${product.name}" telah dilihat.`, null);
        
        return { success: true, message: 'Tampilan produk dicatat.' };
    } catch (error: any) {
        return { success: false, message: error.message || 'Gagal mencatat tampilan produk.' };
    }
};

export const resetAnalyticsData = adminAction(async (user) => {
    const supabase = createClientForActions();
    const defaultData: Omit<AnalyticsData, 'id'> = { daily_visitors: Array(7).fill(null).map((_, i) => ({ day: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'][i], visitors: 0 })), top_products: [], weekly_summary: { total_revenue: 0, total_rentals: 0 } };
    const { error } = await supabase.from('analytics').update(defaultData).eq('id', 1);

    if (error) return { success: false, message: `Gagal mereset data: ${error.message}`};

    await logActivity('Reset Analitik', 'Data overview dasbor telah direset.', user);
    
    revalidatePath('/dashboard');
    return { success: true, message: "Data analitik berhasil direset." };
});

export async function getSettings(): Promise<SiteSettings> {
    const supabase = createClientForActions();
    const { data } = await supabase.from('settings').select('*').single();
    const defaultSettings: SiteSettings = {
        email: '', phone: '', address: '', whatsapp_number: '', 
        social: { twitter: '#', facebook: '#', instagram: '#' },
        logo_url: null,
    };
    
    if (!data) return defaultSettings;
    
    return {
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        whatsapp_number: data.whatsapp_number || '',
        social: data.social || { twitter: '#', facebook: '#', instagram: '#' },
        logo_url: data.logo_url || null
    };
}


export const updateSettings = adminAction(async (user, data: FormData) => {
    const supabase = createSupabaseAdminClient();
    const formDataObj = Object.fromEntries(data.entries());

    const validatedFields = SettingsSchema.safeParse(formDataObj);
    if (!validatedFields.success) {
        const firstErrorKey = Object.keys(validatedFields.error.flatten().fieldErrors)[0];
        const errorMessage = validatedFields.error.flatten().fieldErrors[firstErrorKey]?.[0] || 'Data tidak valid.';
        return { success: false, message: errorMessage };
    }
    
    let newLogoUrl = formDataObj.logo_url_existing as string || null;
    const logoFile = data.get('logo_new') as File | null;
    if (logoFile && logoFile.size > 0) {
        newLogoUrl = await uploadImage(logoFile, 'site-assets');
    }

    const { error } = await supabase.from('settings').update({
        email: validatedFields.data.email,
        phone: validatedFields.data.phone,
        address: validatedFields.data.address,
        whatsapp_number: validatedFields.data.whatsapp_number,
        social: {
            twitter: validatedFields.data.social_twitter,
            facebook: validatedFields.data.social_facebook,
            instagram: validatedFields.data.social_instagram,
        },
        logo_url: newLogoUrl
    }).eq('id', 1);

    if (error) return { success: false, message: `Gagal memperbarui pengaturan: ${error.message}` };

    await logActivity('Ubah Pengaturan', 'Pengaturan situs telah diperbarui.', user);
    
    revalidatePath('/', 'layout');
    return { success: true, message: 'Pengaturan berhasil diperbarui.' };
});

export const addCategory = adminAction(async (user, data: FormData) => {
    const supabase = createClientForActions();
    const validatedFields = CategorySchema.safeParse(Object.fromEntries(data.entries()));
    if (!validatedFields.success) {
        return { success: false, message: validatedFields.error.flatten().fieldErrors.name?.[0] || "Input tidak valid." };
    }
    const { name } = validatedFields.data;
    
    const { error } = await supabase.from('categories').insert({ name });
    if (error) {
        if (error.code === '23505') return { success: false, message: 'Nama kategori sudah ada.' };
        return { success: false, message: `Gagal menambahkan kategori: ${error.message}` };
    }

    await logActivity('Tambah Kategori', `Kategori "${name}" telah ditambahkan.`, user);
    
    revalidatePath('/dashboard/categories');
    return { success: true, message: 'Kategori berhasil ditambahkan.' };
});

export const updateCategory = adminAction(async (user, id: number, data: FormData) => {
    const supabase = createClientForActions();
    const validatedFields = CategorySchema.safeParse(Object.fromEntries(data.entries()));
    if (!validatedFields.success) return { success: false, message: "Input tidak valid." };
    
    const { error } = await supabase.from('categories').update({ name: validatedFields.data.name }).eq('id', id);
    if (error) return { success: false, message: `Gagal memperbarui kategori: ${error.message}` };

    await logActivity('Ubah Kategori', `Kategori ID ${id} diubah.`, user);
    revalidatePath('/dashboard/categories');
    return { success: true, message: 'Kategori berhasil diperbarui.' };
});

export const deleteCategory = adminAction(async (user, id: number) => {
    const supabase = createClientForActions();
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return { success: false, message: `Gagal menghapus kategori: ${error.message}` };

    await logActivity('Hapus Kategori', `Kategori ID ${id} telah dihapus.`, user);
    revalidatePath('/dashboard/categories');
    return { success: true, message: 'Kategori berhasil dihapus.' };
});

export const addSubcategory = adminAction(async (user, data: FormData) => {
    const supabase = createClientForActions();
    const validatedFields = SubcategorySchema.safeParse(Object.fromEntries(data.entries()));
    if (!validatedFields.success) return { success: false, message: "Input tidak valid." };

    const { name, category_id } = validatedFields.data;
    const { error } = await supabase.from('subcategories').insert({ name, category_id });
    if (error) return { success: false, message: `Gagal menambahkan subkategori: ${error.message}` };
    
    await logActivity('Tambah Subkategori', `Subkategori "${name}" ditambahkan.`, user);
    revalidatePath('/dashboard/subcategories');
    return { success: true, message: 'Subkategori berhasil ditambahkan.' };
});

export const updateSubcategory = adminAction(async (user, id: number, data: FormData) => {
    const supabase = createClientForActions();
    const validatedFields = SubcategorySchema.safeParse(Object.fromEntries(data.entries()));
    if (!validatedFields.success) return { success: false, message: "Input tidak valid." };

    const { name, category_id } = validatedFields.data;
    const { error } = await supabase.from('subcategories').update({ name, category_id }).eq('id', id);
    if (error) return { success: false, message: `Gagal memperbarui subkategori: ${error.message}` };
    
    await logActivity('Ubah Subkategori', `Subkategori ID ${id} diperbarui.`, user);
    revalidatePath('/dashboard/subcategories');
    return { success: true, message: 'Subkategori berhasil diperbarui.' };
});

export const deleteSubcategory = adminAction(async (user, id: number) => {
    const supabase = createClientForActions();
    const { error } = await supabase.from('subcategories').delete().eq('id', id);
    if (error) return { success: false, message: `Gagal menghapus subkategori: ${error.message}` };

    await logActivity('Hapus Subkategori', `Subkategori ID ${id} dihapus.`, user);
    revalidatePath('/dashboard/subcategories');
    return { success: true, message: 'Subkategori berhasil dihapus.' };
});

export const getBackupData = adminAction(async (user) => {
    const supabase = createClientForActions();
    const tables = ['products', 'categories', 'subcategories', 'rentals', 'profiles', 'settings', 'activity_log'];
    const backupData: Record<string, any[]> = {};

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*');
        if (error) {
            return { success: false, message: `Gagal mengambil data dari tabel ${table}: ${error.message}` };
        }
        backupData[table] = data;
    }
    
    await logActivity('Backup Data', `Backup data lengkap telah dibuat.`, user);
    return { success: true, message: 'Backup data berhasil diambil.', data: backupData };
});

export const resetRentals = adminAction(async (user) => {
    const supabase = createClientForActions();
    const { error } = await supabase.from('rentals').delete().neq('id', 0); // Delete all
    if (error) return { success: false, message: 'Gagal mereset data penyewaan.'};

    await logActivity('Reset Data', 'Semua data penyewaan telah direset.', user);
    revalidatePath('/dashboard/rentals');
    return { success: true, message: 'Data penyewaan berhasil direset.' };
});

export const resetActivityLog = adminAction(async (user) => {
    const supabase = createClientForActions();
    await logActivity('Reset Log', 'Semua log aktivitas akan dihapus.', user);
    
    const { error } = await supabase.from('activity_log').delete().neq('id', 0);
    if (error) return { success: false, message: 'Gagal mereset log.'};

    revalidatePath('/dashboard/logs');
    return { success: true, message: 'Log aktivitas berhasil direset.' };
});

export const getUsers = adminAction(async (): Promise<{ success: boolean, message: string, data?: MockUser[]}> => {
    const supabase = createSupabaseAdminClient();
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers({
             page: 1, perPage: 100 
    });

    if (usersError) return { success: false, message: usersError.message, data: [] };

    const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*');
    if (profilesError) return { success: false, message: profilesError.message, data: [] };
    
    const profileMap = new Map(profiles.map(p => [p.id, p]));

    const result = users.map(u => {
        const profile = profileMap.get(u.id);
        return {
            uid: u.id,
            username: profile?.username || 'N/A',
            displayName: profile?.display_name || u.email || '',
            role: profile?.role || 'user',
            email: u.email || null,
            photoURL: profile?.avatar_url || u.user_metadata.avatar_url || u.user_metadata.picture || null,
        };
    });

    return { success: true, message: 'Users fetched successfully.', data: result };
});

export const deleteUser = adminAction(async(user, userIdToDelete: string) => {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.auth.admin.deleteUser(userIdToDelete);
    if (error) return { success: false, message: `Gagal menghapus pengguna: ${error.message}` };

    await logActivity('Hapus Pengguna', `Pengguna dengan ID ${userIdToDelete} telah dihapus.`, user);

    revalidatePath('/dashboard/users');
    return { success: true, message: 'Pengguna berhasil dihapus.' };
});

export const updateUserProfile = userAction(async (user, formData: FormData): Promise<{ success: boolean; message:string; data?: MockUser }> => {
    const ip = getIp();
    if (rateLimit(`updateProfile:${user.uid}:${ip}`, 10, 60 * 1000 * 5)) { // 10 requests per 5 minutes
        return { success: false, message: 'Terlalu banyak percobaan. Harap tunggu beberapa saat.' };
    }
    
    const supabase = createClientForActions();
    
    const displayName = formData.get('displayName') as string;
    const username = formData.get('username') as string;
    const avatarFile = formData.get('avatar_new') as File | null;
    
    let avatarUrl: string | undefined = undefined;

    // Upload new avatar if provided
    if (avatarFile && avatarFile.size > 0) {
        // Use user's UID to create a folder for their assets, enhancing security & organization
        const pathPrefix = `${user.uid}/`;
        avatarUrl = await uploadImage(avatarFile, 'site-assets', pathPrefix);
    }
    
    // Update profile in 'profiles' table
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({ 
            display_name: displayName,
            username: username.toLowerCase(),
            ...(avatarUrl && { avatar_url: avatarUrl })
        })
        .eq('id', user.uid)
        .select()
        .single();
        
    if (profileError || !profileData) return { success: false, message: 'Gagal memperbarui profil di database.' };

    // Update user metadata in 'auth.users'
    const { data: authData, error: authError } = await supabase.auth.updateUser({
        data: { 
            display_name: displayName,
            avatar_url: avatarUrl || user.photoURL // Use new URL, or keep old if no new one
        }
    });

    if (authError || !authData.user) return { success: false, message: 'Gagal memperbarui data autentikasi.' };

    await logActivity('Ubah Profil', 'Profil pengguna telah diperbarui.', user);
    
    const updatedUser: MockUser = {
        ...user,
        displayName: profileData.display_name,
        username: profileData.username,
        photoURL: profileData.avatar_url
    };
    
    return { success: true, message: 'Profil berhasil diperbarui.', data: updatedUser };
});


export const changeUserPassword = userAction(async (user, currentPass: string, newPass: string) => {
    return { success: false, message: 'Fitur ubah kata sandi harus dilakukan dari sisi klien.' };
});

const changeRentalStatus = adminAction(async (user, rentalId: number, newStatus: RentalStatus, logAction: string) => {
    const supabase = createClientForActions();
    const { data, error } = await supabase.from('rentals').update({ status: newStatus }).eq('id', rentalId).select().single();
    if (error) return { success: false, message: `Gagal memperbarui status: ${error.message}` };

    await logActivity(logAction, `Status penyewaan ID ${rentalId} diubah menjadi ${newStatus}.`, user);

    revalidatePath('/dashboard/rentals');
    revalidatePath('/profile');
    return { success: true, message: 'Status penyewaan berhasil diperbarui.' };
});

export const activateRental = async (rentalId: number) => changeRentalStatus(rentalId, 'active', 'Aktifkan Penyewaan');
export const cancelRental = async (rentalId: number) => changeRentalStatus(rentalId, 'cancelled', 'Batalkan Penyewaan');


export const completeRental = adminAction(async (user, rentalId: number) => {
    const supabase = createClientForActions();
    const { data: rental, error: rError } = await supabase.from('rentals').select('*').eq('id', rentalId).single();
    if (rError || !rental) return { success: false, message: 'Penyewaan tidak ditemukan.' };
    
    const { error: updateError } = await supabase.from('rentals').update({ status: 'completed' }).eq('id', rentalId);
    if (updateError) return { success: false, message: 'Gagal menyelesaikan penyewaan.' };
    
    const { data, error } = await supabase.from('analytics').select('*').single();
    if (error || !data) return { success: false, message: 'Gagal memperbarui analitik.' };
    
    const analytics: AnalyticsData = data;
    analytics.weekly_summary.total_revenue = (analytics.weekly_summary.total_revenue || 0) + rental.total;
    analytics.weekly_summary.total_rentals = (analytics.weekly_summary.total_rentals || 0) + 1;
    await supabase.from('analytics').update(analytics).eq('id', 1);

    await logActivity('Selesaikan Penyewaan', `Penyewaan ID ${rentalId} oleh ${rental.user_name} telah diselesaikan.`, user);

    revalidatePath('/dashboard/rentals');
    revalidatePath('/dashboard');
    revalidatePath('/profile');
    return { success: true, message: 'Status penyewaan berhasil diperbarui.' };
});

export const getUserRentals = userAction(async (user): Promise<{ success: boolean; message: string; data?: Rental[] }> => {
    const supabase = createClientForActions();
    const { data, error } = await supabase.from('rentals').select('*').eq('user_id', user.uid).order('checkout_date', { ascending: false });
    if (error) return { success: false, message: 'Gagal mengambil riwayat penyewaan.', data: [] };
    return { success: true, message: 'User rentals fetched.', data: data || [] };
});

export const subscribeToNewsletter = async (data: FormData) => {
    const ip = getIp();
    if (rateLimit(`newsletter:${ip}`, 2, 60 * 1000 * 10)) { // 2 requests per 10 minutes
        return { success: false, message: 'Terlalu banyak percobaan. Harap tunggu beberapa saat.' };
    }

    const validatedFields = NewsletterSchema.safeParse(Object.fromEntries(data.entries()));
    if (!validatedFields.success) {
        return { success: false, message: validatedFields.error.flatten().fieldErrors.email?.[0] || "Input tidak valid." };
    }

    // Simple honeypot check
    if (data.get('name')) {
      // Silently fail for bots
      console.log("Honeypot triggered for newsletter subscription.");
      return { success: true, message: "Terima kasih telah berlangganan!" };
    }

    await logActivity('Berlangganan', `Email "${validatedFields.data.email}" berlangganan berita.`, null);
    return { success: true, message: "Terima kasih telah berlangganan!" };
}

export const signOutUser = async () => {
  'use server';
  const supabase = createClientForActions();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
}

export async function getReportData(): Promise<{ success: boolean; message: string; data?: string }> {
    const supabase = createClientForActions();
    
    const { data: { session }} = await supabase.auth.getSession();
    if (!session) {
        return { success: false, message: "Unauthorized" };
    }
    
    // Fetch all necessary data
    const [rentalsRes, usersRes, productsRes, categoriesRes] = await Promise.all([
        supabase.from('rentals').select('*').eq('status', 'completed'),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('products').select('id, category_id, name'),
        supabase.from('categories').select('id, name')
    ]);

    if (rentalsRes.error || usersRes.error || productsRes.error || categoriesRes.error) {
        return { success: false, message: `Gagal mengambil data untuk laporan.` };
    }
    
    const reportData = {
        rentals: rentalsRes.data || [],
        totalUsers: usersRes.count || 0,
        products: productsRes.data || [],
        categories: categoriesRes.data || []
    };

    // Process data for the document
    const totalRevenue = reportData.rentals.reduce((acc, r) => acc + r.total, 0);
    const totalRentals = reportData.rentals.length;
    
    const categoryNameMap = new Map(reportData.categories.map(c => [c.id, c.name]));
    const productCategoryMap = new Map(reportData.products.map(p => [p.id, categoryNameMap.get(p.category_id) || 'Uncategorized']));
    
    const categoryDistribution: { [key: string]: number } = {};
    reportData.rentals.forEach(rental => {
        rental.items.forEach(item => {
            const categoryName = productCategoryMap.get(item.id) || 'Uncategorized';
            categoryDistribution[categoryName] = (categoryDistribution[categoryName] || 0) + 1;
        });
    });

    const categoryRows = Object.entries(categoryDistribution).map(([name, count]) => 
        new TableRow({
            children: [
                new TableCell({ children: [new Paragraph(name)] }),
                new TableCell({ children: [new Paragraph(count.toString())] }),
            ],
        })
    );

    // Create a new Word document
    const doc = new Document({
        sections: [{
            children: [
                new Paragraph({ text: "Laporan Performa BDA.Camp", heading: HeadingLevel.TITLE }),
                new Paragraph({ text: `Dibuat pada: ${format(new Date(), "d MMMM yyyy, HH:mm", { locale: id })}`, style: "italic" }),
                
                new Paragraph({ text: "Ringkasan Umum", heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
                new Paragraph({ children: [ new TextRun({ text: "Total Pendapatan: ", bold: true }), new TextRun(formatPrice(totalRevenue)) ]}),
                new Paragraph({ children: [ new TextRun({ text: "Total Penyewaan Selesai: ", bold: true }), new TextRun(`${totalRentals} transaksi`) ]}),
                new Paragraph({ children: [ new TextRun({ text: "Total Pengguna Terdaftar: ", bold: true }), new TextRun(`${reportData.totalUsers} pengguna`) ]}),

                new Paragraph({ text: "Distribusi Penyewaan per Kategori", heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({text: "Nama Kategori", style: "strong"})]}),
                                new TableCell({ children: [new Paragraph({text: "Jumlah Disewa", style: "strong"})]}),
                            ],
                            tableHeader: true,
                        }),
                        ...categoryRows
                    ],
                }),
            ],
        }],
         styles: {
            paragraph: {
                strong: {
                    run: {
                        bold: true,
                    },
                },
                italic: {
                     run: {
                        italics: true,
                    },
                }
            }
        }
    });

    // Serialize the document to a buffer and then to a Base64 string
    const buffer = await Packer.toBuffer(doc);
    const base64String = Buffer.from(buffer).toString('base64');
    
    return { success: true, message: "Report data generated", data: base64String };
}
