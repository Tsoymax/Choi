import { ConversationScreen } from "@/components/chat/ConversationScreen";

type ConversationPageProps = {
  params: Promise<{
    conversationId: string;
  }>;
};

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = await params;

  return <ConversationScreen conversationId={conversationId} />;
}
