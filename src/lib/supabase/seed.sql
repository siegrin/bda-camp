--
-- Seed data for the application
--

-- Insert initial categories
INSERT INTO public.categories (name) VALUES
    ('Tenda'),
    ('Tas & Ransel'),
    ('Peralatan Tidur'),
    ('Peralatan Masak'),
    ('Penerangan'),
    ('Aksesoris');

-- Insert initial subcategories
INSERT INTO public.subcategories (category_id, name) VALUES
    (1, 'Tenda Dome'),
    (1, 'Tenda Flysheet'),
    (2, 'Carrier'),
    (2, 'Daypack'),
    (3, 'Sleeping Bag'),
    (3, 'Matras'),
    (4, 'Kompor'),
    (4, 'Nesting (Panci Set)'),
    (5, 'Lampu Tenda'),
    (5, 'Headlamp'),
    (6, 'Trekking Pole'),
    (6, 'Jas Hujan');

-- Insert initial products
INSERT INTO public.products (name, price_per_day, category_id, subcategory_id, images, description, specs, availability, data_ai_hint, object_fit) VALUES
    ('Tenda Dome Kapasitas 4 Orang', 35000, 1, 1, '{"https://placehold.co/600x400.png"}', 'Tenda dome yang luas dan tahan air, cocok untuk kelompok kecil atau keluarga. Mudah dipasang dan memiliki ventilasi yang baik.', '{"Kapasitas": "4 orang", "Berat": "4.5 kg", "Ukuran": "210x240x130cm", "Frame": "Fiberglass"}', 'Tersedia', 'camping tent', 'cover'),
    ('Tas Carrier 60L', 25000, 2, 3, '{"https://placehold.co/600x400.png"}', 'Tas carrier dengan kapasitas besar, dilengkapi dengan backsystem yang nyaman untuk pendakian jarak jauh.', '{"Kapasitas": "60 Liter", "Bahan": "Nylon Dolby", "Fitur": "Rain cover, Kantong samping"}', 'Tersedia', 'hiking backpack', 'cover'),
    ('Sleeping Bag Comfort', 15000, 3, 5, '{"https://placehold.co/600x400.png"}', 'Sleeping bag yang hangat dan nyaman, menjaga suhu tubuh tetap stabil di cuaca dingin.', '{"Suhu Nyaman": "15°C", "Berat": "900 gram", "Model": "Mummy"}', 'Tersedia', 'sleeping bag', 'cover'),
    ('Kompor Portable Mini', 10000, 4, 7, '{"https://placehold.co/600x400.png"}', 'Kompor gas mini yang ringan dan ringkas, sangat praktis untuk memasak saat berkemah.', '{"Bahan Bakar": "Gas Hi-Cook", "Berat": "300 gram", "Fitur": "Pemantik otomatis"}', 'Tersedia', 'portable stove', 'contain'),
    ('Headlamp LED Terang', 12000, 5, 10, '{"https://placehold.co/600x400.png"}', 'Headlamp dengan pencahayaan LED yang sangat terang, memiliki beberapa mode pencahayaan.', '{"Kekuatan Cahaya": "300 Lumens", "Baterai": "3x AAA", "Mode": "Terang, Redup, Strobo"}', 'Tersedia', 'headlamp', 'cover'),
    ('Matras Gulung Standard', 5000, 3, 6, '{"https://placehold.co/600x400.png"}', 'Matras camping standar untuk alas tidur yang lebih nyaman di permukaan yang tidak rata.', '{"Ukuran": "180x60cm", "Ketebalan": "4mm", "Bahan": "Spon"}', 'Tersedia', 'sleeping pad', 'cover'),
    ('Set Panci Nesting DS-200', 15000, 4, 8, '{"https://placehold.co/600x400.png"}', 'Set peralatan masak ringkas yang terdiri dari panci, wajan, dan mangkuk. Cocok untuk 1-2 orang.', '{"Isi": "Panci, Wajan, 2 Mangkuk, Sendok, Spon", "Bahan": "Aluminium Anodized"}', 'Tersedia', 'cooking set', 'contain');

-- Insert initial settings
-- This ensures that there's always one row in the settings table for the app to read.
INSERT INTO public.settings (id, email, phone, address, whatsapp_number, social, logo_url)
VALUES (1, '', '', '', '', '{"twitter": "#", "facebook": "#", "instagram": "#"}', null)
ON CONFLICT (id) DO NOTHING;

-- Insert initial analytics data
-- This ensures that there's always one row in the analytics table.
INSERT INTO public.analytics (id, daily_visitors, top_products, weekly_summary)
VALUES (1, '[]', '[]', '{"total_revenue": 0, "total_rentals": 0}')
ON CONFLICT (id) DO NOTHING;
