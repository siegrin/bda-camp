-- Gunakan skrip ini di SQL Editor dasbor Supabase Anda untuk membuat pengguna admin.
-- Skrip ini aman untuk dijalankan berulang kali.

-- Langkah 1: Buat fungsi untuk menyisipkan pengguna dengan aman
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS VOID AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Periksa apakah pengguna admin sudah ada di auth.users
    SELECT id INTO user_id FROM auth.users WHERE email = 'admin@example.com';

    -- Jika tidak ada, buat pengguna baru
    IF user_id IS NULL THEN
        -- Buat pengguna di auth.users. Passwordnya adalah 'adminpassword'
        INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            uuid_generate_v4(),
            'authenticated',
            'authenticated',
            'admin@example.com',
            crypt('adminpassword', gen_salt('bf')),
            current_timestamp,
            '{"provider":"email","providers":["email"]}',
            '{"display_name":"Admin"}',
            current_timestamp,
            current_timestamp
        ) RETURNING id INTO user_id;
    END IF;

    -- Langkah 2: Buat atau perbarui profil publik
    -- Ini akan menautkan pengguna auth ke tabel profil dan memberinya peran 'admin'.
    INSERT INTO public.profiles (id, display_name, role)
    VALUES (user_id, 'Admin', 'admin')
    ON CONFLICT (id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        role = EXCLUDED.role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Langkah 2: Jalankan fungsi untuk membuat pengguna admin
SELECT create_admin_user();
