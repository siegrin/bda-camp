
'use server';

import type { Product, Category, Subcategory, ActivityLog, AnalyticsData, Rental } from './types';
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Use a function to get the correct client based on the context
// This function is specifically for server-side usage in Server Components and Route Handlers.
function createClientForServer() {
    const cookieStore = cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
        cookies: {
            get(name: string) {
            return cookieStore.get(name)?.value
            },
        },
        }
  )
}


export async function getProducts(): Promise<{ products: Product[] }> {
    const supabase = createClientForServer();
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            categories (name),
            subcategories (name)
        `);
        
    if (error) {
        console.error("Error fetching products:", error);
        return { products: [] };
    }

    const products = data.map(p => ({
        ...p,
        category: p.categories?.name || 'N/A',
        subcategory: p.subcategories?.name || 'N/A'
    }));
    
    return { products };
}

export async function getProductById(id: number): Promise<Product | null> {
    const supabase = createClientForServer();
    const { data, error } = await supabase
        .from('products')
        .select(`*, categories (name), subcategories (name)`)
        .eq('id', id)
        .single();
        
    if (error || !data) {
        console.error(`Error fetching product ${id}:`, error);
        return null;
    }
    
    return {
        ...data,
        category: data.categories?.name || 'N/A',
        subcategory: data.subcategories?.name || 'N/A'
    };
}


export async function getProductFilters() {
    const supabase = createClientForServer();
    const [categoriesRes, subcategoriesRes] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('subcategories').select('*'),
    ]);
    
    return { 
        categories: categoriesRes.data || [], 
        subcategories: subcategoriesRes.data || [] 
    };
}


export async function getDashboardProducts(): Promise<Product[]> {
    const { products } = await getProducts();
    return products;
}

export async function getDashboardCategories(): Promise<Category[]> {
    const supabase = createClientForServer();
    const { data } = await supabase.from('categories').select('*');
    return data || [];
}

export async function getDashboardSubcategories(): Promise<Subcategory[]> {
    const supabase = createClientForServer();
    const { data } = await supabase.from('subcategories').select(`*, categories (name)`);
    
    return (data || []).map(sc => ({
        ...sc,
        category: sc.categories?.name || 'N/A'
    }));
}

export async function getActivityLogs(): Promise<ActivityLog[]> {
    const supabase = createClientForServer();
    const { data } = await supabase.from('activity_log').select('*').order('timestamp', { ascending: false }).limit(100);
    return data || [];
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
    const supabase = createClientForServer();
    const [analyticsRes, productsRes, usersRes] = await Promise.all([
        supabase.from('analytics').select('*').single(),
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' })
    ]);
    
    const defaultData: AnalyticsData = { 
        daily_visitors: [], 
        top_products: [], 
        weekly_summary: { total_revenue: 0, total_rentals: 0 },
        total_products: 0,
        total_users: 0,
    };

    if (analyticsRes.error) {
        console.error("Error fetching analytics data:", analyticsRes.error);
        return defaultData;
    }

    return {
        ...analyticsRes.data,
        total_products: productsRes.count ?? 0,
        total_users: usersRes.count ?? 0,
    } || defaultData;
}

export async function getRentals(): Promise<Rental[]> {
    const supabase = createClientForServer();
    const { data } = await supabase.from('rentals').select('*').order('checkout_date', { ascending: false });
    return data || [];
}

export async function getPendingRentalsCount(): Promise<number> {
    const supabase = createClientForServer();
    const { count, error } = await supabase
        .from('rentals')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');
    
    if (error) {
        console.error('Error fetching pending rentals count:', error);
        return 0;
    }
    
    return count || 0;
}
