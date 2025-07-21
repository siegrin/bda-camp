
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { getProductById } from "@/lib/products";
import { AddToCartForm } from "./add-to-cart-form";
import { Breadcrumb } from "@/components/breadcrumb";
import { ProductViewTracker } from "./product-view-tracker";
import { ProductGallery } from "./product-gallery";
import { RecommendedProducts } from "./recommended-products";
import { AdminToolbar } from "./admin-toolbar";
import { createClient } from "@/lib/supabase/server";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id as string);
  if (!id || isNaN(id)) {
    notFound();
  }
  
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userRole = 'user';
  if (user) {
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    if (profile) {
        userRole = profile.role;
    }
  }


  const product = await getProductById(id);

  if (!product) {
    notFound();
  }
  
  const images = product.images?.length ? product.images : ['https://placehold.co/600x400.png'];

  const breadcrumbItems = [
    { name: "Beranda", href: "/" },
    { name: "Katalog", href: "/equipment" },
    { name: product.category, href: `/equipment?category=${encodeURIComponent(product.category)}`},
    { name: product.name, href: `/equipment/${product.id}` }
  ];

  return (
    <>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <ProductViewTracker productId={id} />
        {userRole === 'admin' && <AdminToolbar product={product} />}
        <Breadcrumb items={breadcrumbItems} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 mt-6">
          <div className="relative">
             <ProductGallery images={images} productName={product.name} dataAiHint={product.data_ai_hint} objectFit={product.object_fit} />
          </div>
          
          <div className="flex flex-col">
            <div>
              <Badge 
                variant={product.availability === 'Tersedia' ? 'primary' : 'destructive'}
                className="mb-2 w-fit"
              >
                {product.availability}
              </Badge>
              <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">{product.name}</h1>
              <p className="mt-2 text-2xl font-bold text-primary">
                {formatPrice(product.price_per_day)} <span className="text-base font-normal text-muted-foreground">/ hari</span>
              </p>
              <p className="mt-4 text-base leading-relaxed md:text-lg text-muted-foreground">{product.description}</p>
            </div>
            
            <Separator className="my-6" />

            <div>
              <h2 className="font-headline text-2xl font-bold">Spesifikasi</h2>
              <ul className="mt-4 space-y-2 text-sm md:text-base">
                {product.specs && Object.entries(product.specs).map(([key, value]) => (
                  <li key={key} className="flex justify-between">
                    <span className="font-medium text-muted-foreground">{key}:</span>
                    <span className="font-bold text-right">{value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator className="my-6" />
            
            <div className="rounded-lg border bg-card p-4 mt-auto">
               <AddToCartForm product={product} />
            </div>
          </div>
        </div>
      </div>
      <RecommendedProducts currentProduct={product} />
    </>
  );
}
