"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import IconeSair from "@/imagens/logout.svg";
import Logo from "@/imagens/logo1.png";

export default function Topbar() {
  const router = useRouter();

  const sair = () => {
    localStorage.clear();
    router.push("/");
  };

  return (
    <header className=" w-full h-[100px] bg-[#C7EAFF] flex justify-between items-center">
      <div className=" w-full bg-[#C7EAFF]">
        <div className=" flex justify-between items-center">
          <Link href="/">
            <Image
              className="relative mt-5 ml-[45px] w-[190px]"
              src={Logo}
              alt="Logo Mednow"
            />
          </Link>
          <div className="flex flex-row gap-10 mr-[32px]">
            <button className="flex items-center group" onClick={sair}>
              <Image
                className="w-[33.33px] h-[30px] transition duration-300 group-hover:brightness-0 group-hover:invert"
                src={IconeSair}
                alt="icone Sair"
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
