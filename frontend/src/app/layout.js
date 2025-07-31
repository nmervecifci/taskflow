import { ReduxProvider } from "@/components/ReduxProvider";
import "./globals.css";

export const metadata = {
  title: "Proje Yönetim Sistemi",
  description: "Modern proje ve görev yönetim platformu",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="bg-gray-50 min-h-screen antialiased">
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}


