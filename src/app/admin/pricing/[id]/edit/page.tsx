import EditPricingForm from './EditPricingForm';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPricingPage({ params }: PageProps) {
  const { id } = await params;
  return <EditPricingForm id={id} />;
} 