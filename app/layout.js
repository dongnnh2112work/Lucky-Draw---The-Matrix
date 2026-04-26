import "./globals.css";

export const metadata = {
  title: "Giai Ma Du Lieu - Lucky Draw",
  description: "Lucky draw cyberpunk style",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
