import Image from "next/image";

export function NotificationsEmptyState() {
  return (
    <section className="rounded-[24px] bg-white p-8 text-center shadow-[0_18px_60px_rgba(24,32,29,0.08)] sm:p-10">
      <Image src="/mascot.svg" alt="Choi" width={92} height={92} className="mx-auto mb-5" />
      <h2 className="text-3xl font-semibold text-ink">Пока всё спокойно</h2>
      <p className="mx-auto mt-3 max-w-xl text-lg leading-8 text-ink/62">
        Здесь появятся сообщения, сделки и новости Choi
      </p>
    </section>
  );
}
