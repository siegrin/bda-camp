
import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

config({ path: '.env' });

const productsData = [
    {
      name: "Tenda Dome Pro 4 Orang",
      pricePerDay: 150000,
      category: "Tenda",
      images: ['https://placehold.co/600x400.png'],
      dataAiHint: 'dome tent',
      description: "Tenda dome yang luas dan tahan cuaca, ideal untuk kelompok kecil atau keluarga. Mudah dipasang dan dibawa.",
      specs: {
        "Kapasitas": "4 Orang",
        "Berat": "4.5 kg",
        "Tahan Air": "3000mm"
      },
      availability: 'Tersedia'
    },
    {
      name: "Ransel Gunung Explorer 60L",
      pricePerDay: 75000,
      category: "Tas & Ransel",
      images: ['https://placehold.co/600x400.png'],
      dataAiHint: 'hiking backpack',
      description: "Ransel berkapasitas besar dengan banyak kompartemen untuk pendakian multi-hari. Sistem punggung yang nyaman.",
      specs: {
        "Kapasitas": "60 Liter",
        "Berat": "1.8 kg",
        "Bahan": "Nylon Ripstop"
      },
      availability: 'Tersedia'
    },
    {
      name: "Sleeping Bag Polar Comfort",
      pricePerDay: 50000,
      category: "Perlengkapan Tidur",
      images: ['https://placehold.co/600x400.png'],
      dataAiHint: 'sleeping bag',
      description: "Sleeping bag hangat yang cocok untuk suhu pegunungan tropis, memberikan kenyamanan maksimal setelah seharian beraktivitas.",
      specs: {
        "Suhu Nyaman": "10°C",
        "Bahan": "Sintetis",
        "Berat": "1.2 kg"
      },
      availability: 'Tersedia'
    },
    {
      name: "Kompor Portable Windproof",
      pricePerDay: 40000,
      category: "Peralatan Masak",
      images: ['https://placehold.co/600x400.png'],
      dataAiHint: 'camping stove',
      description: "Kompor gas portable yang ringkas dengan pelindung angin, memastikan masakan matang sempurna di segala kondisi.",
      specs: {
        "Jenis Bahan Bakar": "Gas Tabung",
        "Berat": "300 g",
        "Fitur": "Pelindung Angin"
      },
      availability: 'Tersedia'
    },
    {
      name: "Lampu Tenda Gantung LED",
      pricePerDay: 25000,
      category: "Pencahayaan",
      images: ['https://placehold.co/600x400.png'],
      dataAiHint: 'camping lantern',
      description: "Lampu LED hemat energi yang dapat digantung di dalam tenda, memberikan penerangan yang cukup untuk aktivitas malam hari.",
      specs: {
        "Tipe Baterai": "AAA x3",
        "Kecerahan": "150 Lumens",
        "Mode": "Terang, Redup, SOS"
      },
      availability: 'Tersedia'
    },
    {
      name: "Kursi Lipat Kemping Santai",
      pricePerDay: 35000,
      category: "Aksesoris",
      images: ['https://placehold.co/600x400.png'],
      dataAiHint: 'camping chair',
      description: "Kursi lipat yang ringan dan kokoh, lengkap dengan tempat gelas. Sempurna untuk bersantai di sekitar api unggun.",
      specs: {
        "Beban Maksimal": "120 kg",
        "Berat": "2 kg",
        "Bahan Rangka": "Baja"
      },
      availability: 'Tersedia'
    },
    {
      name: "Matras Angin Single",
      pricePerDay: 45000,
      category: "Perlengkapan Tidur",
      images: ['https://placehold.co/600x400.png'],
      dataAiHint: 'inflatable mattress',
      description: "Matras angin yang nyaman dan mudah dipompa, memberikan isolasi yang baik dari tanah yang dingin dan lembab.",
      specs: {
        "Ukuran": "190 x 70 cm",
        "Berat": "1 kg",
        "Termasuk": "Pompa Mini"
      },
      availability: 'Tidak Tersedia'
    },
    {
      name: "Set Alat Masak Nesting (2 Orang)",
      pricePerDay: 55000,
      category: "Peralatan Masak",
      images: ['https://placehold.co/600x400.png'],
      dataAiHint: 'cooking set',
      description: "Satu set peralatan masak lengkap yang dapat disusun menjadi satu (nesting) untuk menghemat ruang. Terdiri dari panci, wajan, dan mangkuk.",
      specs: {
        "Material": "Aluminium Anodized",
        "Berat": "600 g",
        "Untuk": "2 Orang"
      },
      availability: 'Tersedia'
    }
];

const categoriesData = [
  { name: "Tenda" },
  { name: "Tas & Ransel" },
  { name: "Perlengkapan Tidur" },
  { name: "Peralatan Masak" },
  { name: "Pencahayaan" },
  { name: "Aksesoris" },
];


async function seedDB() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB...");
    
    const db = client.db("bda-camp");

    // Clear existing data
    await db.collection("products").deleteMany({});
    await db.collection("categories").deleteMany({});
    console.log("Cleared existing collections.");

    // Insert new data
    await db.collection("products").insertMany(productsData);
    await db.collection("categories").insertMany(categoriesData);
    
    console.log("Database has been seeded successfully! 🌱");

  } catch (error) {
    console.error("Error seeding the database:", error);
  } finally {
    await client.close();
    console.log("MongoDB connection closed.");
  }
}

seedDB();
