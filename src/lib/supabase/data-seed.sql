
-- Hapus data lama dari kategori untuk memulai dari awal (aman karena ini data statis)
DELETE FROM subcategories;
DELETE FROM categories;

-- Masukkan data kategori
INSERT INTO categories (id, name) VALUES
(1, 'Tenda'),
(2, 'Perlengkapan Tidur'),
(3, 'Perlengkapan Masak'),
(4, 'Tas & Ransel'),
(5, 'Aksesoris');

-- Masukkan data subkategori
INSERT INTO subcategories (id, name, category_id) VALUES
(1, 'Tenda Dome', 1),
(2, 'Tenda Flysheet', 1),
(3, 'Sleeping Bag', 2),
(4, 'Matras', 2),
(5, 'Kompor', 3),
(6, 'Nesting/Cooking Set', 3),
(7, 'Carrier', 4),
(8, 'Daypack', 4),
(9, 'Lampu & Senter', 5),
(10, 'Lain-lain', 5);

-- Hapus data PENGATURAN & ANALITIK yang ada untuk memastikan data di bawah ini yang digunakan
DELETE FROM settings WHERE id = 1;
DELETE FROM analytics WHERE id = 1;

-- Masukkan data pengaturan dasar untuk situs
INSERT INTO settings (id, email, phone, address, whatsapp_number, social, logo_url) VALUES
(1, 
'info@bda.camp', 
'0812-3456-7890', 
'Jl. Petualang No. 1, Bandung, Indonesia', 
'6281234567890', 
'{"twitter": "https://twitter.com", "facebook": "https://facebook.com", "instagram": "https://instagram.com"}',
'https://bxswlbchrheinpnnjsja.supabase.co/storage/v1/object/public/site-assets/bda-logo.png'
);

-- Inisialisasi data analitik dasar
INSERT INTO analytics (id, daily_visitors, top_products, weekly_summary) VALUES
(1, 
'[{"day": "Sen", "visitors": 0}, {"day": "Sel", "visitors": 0}, {"day": "Rab", "visitors": 0}, {"day": "Kam", "visitors": 0}, {"day": "Jum", "visitors": 0}, {"day": "Sab", "visitors": 0}, {"day": "Min", "visitors": 0}]',
'[]',
'{"total_revenue": 0, "total_rentals": 0}'
);


-- PERINTAH INSERT PRODUK YANG CERDAS
-- Menggunakan ON CONFLICT untuk memperbarui data yang ada tanpa menimpa gambar.
-- Ini akan menjaga gambar yang sudah Anda unggah.
INSERT INTO products (id, name, price_per_day, category_id, subcategory_id, images, data_ai_hint, description, specs, availability, object_fit) VALUES
(1, 'Tenda Dome 4P', 50000, 1, 1, '{"https://placehold.co/600x400.png", "https://placehold.co/600x400.png"}', 'camping tent', 'Tenda dome yang luas dan kokoh, cocok untuk 4 orang. Tahan air dan mudah dipasang.', '{"Kapasitas": "4 Orang", "Berat": "4.5 kg", "Ukuran": "210x240x130 cm"}', 'Tersedia', 'cover'),
(2, 'Sleeping Bag Comfort', 25000, 2, 3, '{"https://placehold.co/600x400.png"}', 'sleeping bag', 'Sleeping bag yang hangat dan nyaman untuk suhu pegunungan tropis.', '{"Suhu Nyaman": "15°C", "Berat": "1.2 kg", "Bahan": "Polyester"}', 'Tersedia', 'cover'),
(3, 'Kompor Portable Mini', 15000, 3, 5, '{"https://placehold.co/600x400.png"}', 'portable stove', 'Kompor lipat yang ringan dan ringkas, andalan untuk memasak di alam bebas.', '{"Bahan": "Stainless Steel", "Berat": "300g", "Bahan Bakar": "Gas Hi-Cook"}', 'Tersedia', 'contain'),
(4, 'Tas Carrier 60L', 60000, 4, 7, '{"https://placehold.co/600x400.png"}', 'hiking backpack', 'Tas carrier dengan kapasitas besar dan back-system yang nyaman untuk pendakian jangka panjang.', '{"Kapasitas": "60 Liter", "Back-System": "Adjustable", "Raincover": "Termasuk"}', 'Tersedia', 'cover'),
(5, 'Lampu Tenda LED', 10000, 5, 9, '{"https://placehold.co/600x400.png"}', 'camping lantern', 'Lampu LED gantung yang terang dan hemat daya, cocok untuk menerangi tenda.', '{"Tipe Baterai": "3x AAA", "Mode Cahaya": "3 (Terang, Redup, SOS)"}', 'Tersedia', 'cover'),
(6, 'Matras Gulung Eva', 5000, 2, 4, '{"https://placehold.co/600x400.png"}', 'sleeping pad', 'Matras spons ringan yang memberikan isolasi dasar dari permukaan tanah.', '{"Bahan": "Spons Eva", "Ukuran": "180x60 cm", "Ketebalan": "4mm"}', 'Tersedia', 'cover'),
(7, 'Nesting Set DS-200', 20000, 3, 6, '{"https://placehold.co/600x400.png"}', 'cooking set', 'Set alat masak ringkas untuk 1-2 orang, terdiri dari panci, wajan, dan mangkuk.', '{"Isi": "Panci, Wajan, 2 Mangkuk, Sendok, Spons", "Berat": "500g"}', 'Tersedia', 'cover'),
(8, 'Tenda Flysheet 3x4m', 20000, 1, 2, '{"https://placehold.co/600x400.png"}', 'tarp shelter', 'Flysheet serbaguna untuk peneduh, bivak darurat, atau lapisan ekstra tenda.', '{"Ukuran": "3x4 Meter", "Bahan": "Polyester Waterproof"}', 'Tersedia', 'cover'),
(9, 'Headlamp Zoom', 12000, 5, 9, '{"https://placehold.co/600x400.png"}', 'headlamp', 'Senter kepala dengan fitur zoom untuk fokus cahaya jarak jauh atau menyebar.', '{"Tipe Baterai": "3x AAA", "Lumens": "180"}', 'Tersedia', 'contain'),
(10, 'Tas Daypack 25L', 25000, 4, 8, '{"https://placehold.co/600x400.png"}', 'daypack backpack', 'Tas ransel ringkas untuk pendakian singkat (summit attack) atau pemakaian sehari-hari.', '{"Kapasitas": "25 Liter", "Kompartemen": "Laptop 14 inch"}', 'Tidak Tersedia', 'cover')
ON CONFLICT (id) DO UPDATE 
SET 
  name = EXCLUDED.name,
  price_per_day = EXCLUDED.price_per_day,
  category_id = EXCLUDED.category_id,
  subcategory_id = EXCLUDED.subcategory_id,
  description = EXCLUDED.description,
  specs = EXCLUDED.specs,
  availability = EXCLUDED.availability,
  object_fit = EXCLUDED.object_fit;
  -- Kolom `images` dan `data_ai_hint` sengaja tidak diupdate untuk mempertahankan gambar yang sudah ada.
```