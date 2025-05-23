import type { Metadata } from "next";
import "./globals.css";
import "@/styles/prism-notion-theme.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RootProvider from "@/Providers/RootProvider";

export const metadata: Metadata = {
  title: "Mublog",
  description: "Muring's blog",
  icons: {
    icon: "/icons/mublog.svg", // 또는 "/icons/custom-icon.svg"
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </RootProvider>
      </body>
    </html>
  );
}
