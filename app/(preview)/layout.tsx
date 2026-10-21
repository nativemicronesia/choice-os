import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { PreviewCartProvider } from "@/components/storefront/PreviewCart";
import { SiteHeader } from "@/components/storefront/SiteHeader";
import { SiteFooter } from "@/components/storefront/SiteFooter";
import { OrderBar } from "@/components/storefront/OrderBar";
import { resolveAsset } from "@/lib/storefront/assets";
import "./storefront.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-sf-display",
  display: "swap",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: { default: "Choice Fast Food", template: "%s · Choice Fast Food" },
  description: "Choice Fast Food in Chuuk: dine-in restaurant and stop-by shop. Sales preview with demo content.",
  robots: { index: false, follow: false },
};

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={display.variable}>
      <PreviewCartProvider>
        <SiteHeader logoSrc={resolveAsset("logo")} />
        <main id="main" tabIndex={-1} className="outline-none">{children}</main>
        <SiteFooter />
        <OrderBar />
      </PreviewCartProvider>
    </div>
  );
}
