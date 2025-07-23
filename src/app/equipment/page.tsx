
import type { Metadata } from 'next';
import EquipmentClientPage from './page-client';

export const metadata: Metadata = {
    title: 'Katalog Peralatan',
    description: 'Jelajahi dan sewa semua peralatan kemah berkualitas tinggi untuk petualangan Anda berikutnya. Dari tenda hingga peralatan masak, kami punya semuanya.',
};

export default function EquipmentPage() {
    return <EquipmentClientPage />;
}
