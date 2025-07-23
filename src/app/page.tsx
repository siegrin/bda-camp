
import { CtaSection } from "@/components/landing/cta-section";
import { FeaturedProductsSection } from "@/components/landing/featured-products-section";
import { HeroSection } from "@/components/landing/hero-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { WhyChooseUsSection } from "@/components/landing/why-choose-us-section";
import { getProducts } from "@/lib/products";
import type { Product } from "@/lib/types";

export default async function LandingPage() {
  let featuredProducts: Product[] = [];
  try {
    const { products } = await getProducts();
    featuredProducts = products.slice(0, 4);
  } catch (error) {
    console.error("Failed to fetch products for landing page:", error);
  }

  return (
    <>
      <HeroSection />
      <FeaturedProductsSection products={featuredProducts} />
      <WhyChooseUsSection />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}
