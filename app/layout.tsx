import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Choice Fast Food",
  description: "Order ahead from Choice Fast Food in Weno, Chuuk.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
