import type { Metadata } from "next";
import "./globals.css";
import {Providers} from "./providers";
import localFont from 'next/font/local'

import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

const myFont = localFont({ src: '../fonts/LINESeedJP_OTF_Bd.woff2', preload: true });

export const metadata: Metadata = {
  title: "NextTube Together",
  description: "みんなで一緒にYouTubeを楽しもう!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${myFont.className} antialiased`}
      >
        <Providers>
          <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
