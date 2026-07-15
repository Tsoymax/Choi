import { DealReviewPageClient } from "@/components/reviews/DealReviewPageClient";

type DealReviewPageProps = {
  params: Promise<{
    dealId: string;
  }>;
};

export default async function DealReviewPage({ params }: DealReviewPageProps) {
  const { dealId } = await params;

  return <DealReviewPageClient dealId={dealId} />;
}
