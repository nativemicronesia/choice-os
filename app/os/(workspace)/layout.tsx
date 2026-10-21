import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { PreviewShell } from "@/components/os-preview/PreviewShell";
import { requireOwnerSession } from "@/lib/auth/require";
import { previewOsEnabled } from "@/lib/auth/preview";
import "./os.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-ox-display",
  display: "swap",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Choice OS",
  description: "Private restaurant workspace preview for Choice Fast Food.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  // Preview mode needs no login. With CHOICE_OS_PREVIEW=off the owner session returns.
  if (!previewOsEnabled()) await requireOwnerSession();
  return (
    <div className={display.variable}>
      <PreviewShell>{children}</PreviewShell>
    </div>
  );
}
