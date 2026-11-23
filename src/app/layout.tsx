import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://givento.in"),
  title: "Givento.in ✨ Handcrafted Gifts, Bouquets & Custom Keepsakes",
  description:
    "Storybook gift shop for handmade sunflower bouquets, personalised nikah frames, resin name keychains, gift hampers, and stainless steel jewellery. Hand-packed with love in India.",
  keywords: [
    "handmade gifts",
    "sunflower bouquet",
    "nikah frame",
    "personalised gifts India",
    "resin keychain",
    "gift hamper for her",
    "givento.in",
    "mehandi hand chain",
  ],
  authors: [{ name: "Givento.in" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Givento.in ✨ Storybook Gift Shop",
    description: "Handcrafted gifts, bouquets, personalised frames & hampers made with soul.",
    url: "https://givento.in",
    siteName: "Givento.in",
    images: [
      {
        url: "/images/givento-logo.png",
        width: 512,
        height: 512,
        alt: "Givento.in Official Brand Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Givento.in ✨ Storybook Gift Shop",
    description: "Handcrafted gifts, bouquets, personalised frames & hampers made with soul.",
    images: ["/images/givento-logo.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FFF7F4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://givento.in/#organization",
        name: "Givento.in",
        url: "https://givento.in",
        logo: "https://givento.in/images/givento-logo.png",
        sameAs: ["https://instagram.com/givento.in"],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+91-93440-13255",
          contactType: "customer service",
          availableLanguage: ["English", "Tamil", "Hindi"],
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://givento.in/#website",
        url: "https://givento.in",
        name: "Givento.in",
        publisher: {
          "@id": "https://givento.in/#organization",
        },
      },
    ],
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Manrope:wght@400;500;600;700;800&family=Caprasimo&family=Caveat:wght@400;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FFF7F4] text-[#2D1527] font-body selection:bg-[#FDEBF0] selection:text-[#7A1C30]">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
