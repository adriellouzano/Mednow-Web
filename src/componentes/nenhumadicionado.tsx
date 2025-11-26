import Image from "next/image";

interface NenhumAdicionadoProps {
  icon: string;
  message2: string;
  message: string;
}

const NenhumAdicionado: React.FC<NenhumAdicionadoProps> = ({
  icon,
  message,
  message2,
}) => {
  return (
    <div className="flex justify-center mt-4">
      <div className="flex flex-col items-center gap-1 text-center">
        <div>
          <Image src={icon} alt="ícone" className=" h-[70px] w-[70px]" />
        </div>
        <div className="flex flex-col">
          <span className="text-black font-semibold">{message2}</span>
          <span className="text-[#E6E6E6] text-2xl">{message}</span>
        </div>
      </div>
    </div>
  );
};
export default NenhumAdicionado;
