import { Roboto } from "next/font/google";
import "../globals.css";
import Image from "next/image";
import Logo from "@/imagens/logo1.png";
import Link from "next/link";
import type { Metadata } from "next";

const roboto = Roboto({
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "Cadastro",
  description: "",
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${roboto.className} antialiased`}>
      {/* Cabeçalho */}
      <div className="w-[100vw] h-[100vh] bg-[#F0F0F5]">
        <div className="w-full h-[100px] bg-[#C7EAFF]">
          <div className="flex">
            {/* Logo*/}
            <div className="ml-[45px] w-[190px]">
              <Link href="/">
                <Image className="" src={Logo} alt="Logo Mednow" />
              </Link>
            </div>
            {/* Botão*/}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
