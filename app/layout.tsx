import "./globals.css";

export const metadata = {
  title: "Diksha Registration",
  description: "Diksha registration and slot allotment system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}