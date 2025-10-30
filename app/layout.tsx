import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "Next.js和Supabase博客系统",
    template: "%s | Next.js和Supabase博客系统"
  },
  description: "使用Next.js和Supabase构建的现代化博客系统，提供优秀的阅读体验",
  keywords: ["Next.js", "Supabase", "博客", "Blog", "React", "TypeScript"],
  authors: [{ name: "博客作者" }],
  creator: "博客系统",
  publisher: "博客系统",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: defaultUrl,
    title: "Next.js和Supabase博客系统",
    description: "使用Next.js和Supabase构建的现代化博客系统，提供优秀的阅读体验",
    siteName: "博客系统",
  },
  twitter: {
    card: "summary_large_image",
    title: "Next.js和Supabase博客系统",
    description: "使用Next.js和Supabase构建的现代化博客系统，提供优秀的阅读体验",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
