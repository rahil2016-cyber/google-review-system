import { PublicRatingFlow } from "@/components/public/PublicRatingFlow";

type PageProps = {
  params: Promise<{ uniqueCode: string }>;
};

export default async function PublicRatingPage({ params }: PageProps) {
  const { uniqueCode } = await params;
  return <PublicRatingFlow uniqueCode={uniqueCode} />;
}
