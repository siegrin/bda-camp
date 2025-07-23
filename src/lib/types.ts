
export type Category = {
  id: number;
  name: string;
};

export type Subcategory = {
    id: number;
    name: string;
    category: string; // Will be joined from categories table
    category_id?: number;
};

export type Product = {
  id: number;
  name: string;
  price_per_day: number;
  category: string; // Joined name
  subcategory: string; // Joined name
  category_id?: number;
  subcategory_id?: number;
  images: string[];
  data_ai_hint?: string;
  description: string;
  specs: { [key: string]: string };
  availability: 'Tersedia' | 'Tidak Tersedia';
  stock: number;
  object_fit?: 'cover' | 'contain';
  categories?: { name: string } | null; // For Supabase join
  subcategories?: { name: string } | null; // For Supabase join
};

export type Testimonial = {
    name: string;
    avatar: string;
    data_ai_hint: string;
    rating: number;
    quote: string;
}

export type UserRole = "admin" | "user";

export interface MockUser {
  uid: string;
  username: string;
  displayName: string;
  email: string | null;
  photoURL: string | null;
  role: UserRole;
}

export interface ActivityLog {
  id: number;
  timestamp: string;
  user_name: string;
  action: string;
  details: string;
}

export interface SiteSettings {
  email: string;
  phone: string;
  address: string;
  whatsapp_number: string;
  social: {
    twitter: string;
    facebook: string;
    instagram: string;
  };
  logo_url: string | null;
}

export interface AnalyticsData {
  id?: number;
  daily_visitors: { day: string; visitors: number }[];
  top_products: { name: string; rentals: number }[];
  weekly_summary: {
    total_revenue: number;
    total_rentals: number;
  };
  total_products: number;
  total_users: number;
}

export type RentalStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface Rental {
    id: number;
    user_id: string;
    user_name: string;
    items: {
        id: number;
        name: string;
        days: number;
        price_per_day: number;
        quantity: number;
    }[];
    total: number;
    status: RentalStatus;
    checkout_date: string;
}

export interface CartItem extends Product {
  days: number;
  quantity: number;
}

export interface ReportData {
  summary: {
    totalRevenue: number;
    totalRentals: number;
    totalUsers: number;
  };
  monthlyRevenue: {
    month: string;
    revenue: number;
  }[];
  categoryDistribution: {
    name: string;
    count: number;
  }[];
}
