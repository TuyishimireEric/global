import TopNav from "@/components/nav/TopNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ganzaa",
  description: "Ganzaa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="gap-2 sm:gap-20 z-20 h-[100vh] w-full relative font-comic">
        <div className="flex-grow z-20 min-h-full">
          <TopNav />
          {children}
        </div>
      </div>
    </>
  );
}
