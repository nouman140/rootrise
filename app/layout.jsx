// import { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import ReduxProvider from "../context/ReduxProvider";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./globals.css";

export const metadata = {
  title: "RootRise - E-commerce Store",
  description: "Your trusted online shopping destination",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body className="bg-gray-50">
        <ReduxProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#363636",
                color: "#fff",
              },
            }}
          />
        </ReduxProvider>
      </body>
    </html>
  );
}
