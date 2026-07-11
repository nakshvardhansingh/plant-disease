import "./globals.css";

export const metadata = {
  title: "Plant Disease Detector | AI-Powered Plant Health Analysis",
  description:
    "Upload a plant leaf image and receive an AI-powered disease analysis with causes, treatments, and prevention tips using Gemini 2.5 Flash.",
  keywords: ["plant disease", "AI", "Gemini Vision", "agriculture", "leaf analysis", "gemini-2.5-flash"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#fcfdf9] text-gray-900 selection:bg-emerald-200 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}
