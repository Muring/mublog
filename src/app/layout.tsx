import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import ThemeProviderWrapper from "@/components/ThemeProvider/ThemeProvider";

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
        <html lang="en">
            <body>
                <Header />
                <ThemeProviderWrapper>
                    <main>{children}</main>
                </ThemeProviderWrapper>
                <Footer />
            </body>
        </html>
    );
}
