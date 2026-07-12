import { PublicProfileScreen } from "@/components/profile/PublicProfileScreen";

type PublicProfilePageProps = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { userId } = await params;

  return <PublicProfileScreen userId={userId} />;
}
