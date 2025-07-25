
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, DollarSign, Activity, Package, LineChart, ListOrdered } from 'lucide-react';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { formatPrice } from '@/lib/utils';
import type { AnalyticsData } from '@/lib/types';
import { getAnalyticsData } from '@/lib/products';
import { motion } from 'framer-motion';
import { LoadingScreen } from '@/components/loading-screen';
import { OverviewActions } from '@/components/dashboard/overview-actions';


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

export default function DashboardOverviewPage() {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    async function loadData() {
        setIsLoading(true);
        const data = await getAnalyticsData();
        setAnalytics(data);
        setIsLoading(false);
    }

    useEffect(() => {
        loadData();
    }, []);
    
    if (isLoading || !analytics) {
        return <LoadingScreen message="Memuat Overview..." />;
    }

    return (
        <motion.div 
            className="flex flex-col gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
             <motion.div className="flex items-center justify-between" variants={itemVariants}>
                <div>
                    <h1 className="text-lg font-semibold md:text-2xl flex items-center gap-2">
                        <LineChart className="h-5 w-5 text-muted-foreground" />
                        Overview & Laporan
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Ringkasan aktivitas, performa, dan unduh laporan lengkap situs Anda.
                    </p>
                </div>
                <OverviewActions onReset={loadData} />
            </motion.div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatPrice(analytics.weekly_summary.total_revenue)}</div>
                            <p className="text-xs text-muted-foreground">Dari penyewaan yang selesai</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Penyewaan Selesai</CardTitle>
                            <ListOrdered className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{analytics.weekly_summary.total_rentals}</div>
                            <p className="text-xs text-muted-foreground">Total transaksi berhasil</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Produk Aktif</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.total_products}</div>
                            <p className="text-xs text-muted-foreground">Total item yang terdaftar</p>
                        </CardContent>
                    </Card>
                </motion.div>
                 <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pelanggan</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.total_users}</div>
                            <p className="text-xs text-muted-foreground">Total pengguna terdaftar</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <motion.div className="col-span-4" variants={itemVariants}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Pengunjung Harian
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <ResponsiveContainer width="100%" height={300}>
                                <RechartsBarChart data={analytics.daily_visitors}>
                                    <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip />
                                    <Bar dataKey="visitors" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div className="col-span-3" variants={itemVariants}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Produk Terpopuler
                            </CardTitle>
                            <CardDescription>Berdasarkan jumlah klik di halaman detail.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Produk</TableHead>
                                        <TableHead className="text-right">Jumlah Dilihat</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {analytics.top_products.slice(0, 5).map(product => (
                                        <TableRow key={product.name}>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell className="text-right">{product.rentals}</TableCell>
                                        </TableRow>
                                    ))}
                                    {analytics.top_products.length === 0 && (
                                         <TableRow>
                                            <TableCell colSpan={2} className="text-center">Belum ada data</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
