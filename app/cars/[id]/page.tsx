import { CarDetailView } from "@/components/car-detail-view";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CarDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <CarDetailView registrationId={id} />;
}
