import "./globals.css";

export const metadata = {
  title: "Kalendarz znajomych",
  description: "Planuj wydarzenia i umawiaj się ze znajomymi",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
