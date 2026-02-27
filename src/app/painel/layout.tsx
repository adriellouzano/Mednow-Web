export const metadata = {
  title: "MedNow - Painel",
  description: "Área administrativa",
};

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="painel-wrapper">{children}</main>;
}
