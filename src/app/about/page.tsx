
import type { Metadata } from "next";
import { AboutClientPage } from "./about-client-page";

export const metadata: Metadata = {
  title: "Cara Pesan & Syarat Ketentuan",
  description: "Pelajari langkah-langkah mudah untuk menyewa peralatan kemah di BDA.Camp dan pahami syarat serta ketentuan yang berlaku.",
};

export default function HowToOrderPage() {
    return <AboutClientPage />;
}
