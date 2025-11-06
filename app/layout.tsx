import "./globals.css";

export const metadata = {
  title: "Tomoni",
  description: "KOR/JP senior community",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* 모바일 노치/주소창 대응 */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="min-h-screen bg-[--app-bg] text-[--app-fg] antialiased">
        <div className="safe flex min-h-screen flex-col">{children}</div>
      </body>
    </html>
  );
}
