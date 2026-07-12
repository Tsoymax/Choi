type QuickRepliesProps = {
  onPick: (text: string) => void;
};

const replies = ["Актуально?", "Можно дешевле?", "Где можно посмотреть?"];

export function QuickReplies({ onPick }: QuickRepliesProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {replies.map((reply) => (
        <button
          key={reply}
          type="button"
          onClick={() => onPick(reply)}
          className="focus-ring shrink-0 rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:border-leaf/30 hover:text-leaf"
        >
          {reply}
        </button>
      ))}
    </div>
  );
}
