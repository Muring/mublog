import type { Metadata } from "next";
import "./globals.css";
import "@/styles/prism-notion-theme.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RootProvider from "@/providers/RootProvider";
import VisitTracker from "@/components/trackers/VisitTracker";

export const metadata: Metadata = {
    //   title: "Mublog",
    title: {
        default: "Mublog",
        template: "Mublog | %s", // 페이지 title이 있으면 "%s | Mublog"로
    },
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
                    <VisitTracker />
                    <Header />
                    <main>{children}</main>
                    <Footer />
                </RootProvider>
            </body>
        </html>
    );
}
