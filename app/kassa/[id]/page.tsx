import { notFound } from "next/navigation";
import { getKassa, getAllKassas, type KassaId } from "@/data/market";
import { KassaView } from "./kassa-view";

export function generateStaticParams() {
  return getAllKassas().map((k) => ({ id: k.id }));
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function KassaPage({ params }: PageProps) {
  const { id } = await params;
  const kassa = getKassa(id as KassaId);
  if (!kassa) notFound();
  return <KassaView kassaId={kassa.id} />;
}
