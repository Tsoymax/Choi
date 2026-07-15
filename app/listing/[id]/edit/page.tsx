import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SellForm, type SellFormInitialListing } from "@/components/sell/SellForm";
import { getCurrentProfileResult } from "@/lib/auth/server";
import { getListingById } from "@/lib/data/listings";
import { getSupabaseErrorInfo } from "@/lib/data/profiles";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type EditListingPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function EditPageShell({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f7f5ef]">
      <header className="border-b border-ink/5 bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex h-24 max-w-[1504px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex cursor-pointer items-center transition hover:opacity-85"
            aria-label="Choi home"
          >
            <Image src="/logo.svg" alt="Choi" width={180} height={72} priority />
          </Link>
          <Link
            href="/profile"
            className="focus-ring inline-flex h-12 items-center gap-2 rounded-full border border-ink/10 bg-white px-5 text-sm font-semibold text-ink shadow-sm transition hover:border-leaf/30"
          >
            <ArrowLeft size={18} />
            Профиль
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1504px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-normal text-ink sm:text-5xl">
            {title}
          </h1>
        </div>
        {children}
      </section>
    </main>
  );
}

function InfoCard({
  title,
  text,
  href,
  action
}: {
  title: string;
  text: string;
  href: string;
  action: string;
}) {
  return (
    <div className="mx-auto max-w-2xl rounded-[24px] bg-white p-8 text-center shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
      <h2 className="text-3xl font-semibold text-ink">{title}</h2>
      <p className="mt-3 text-ink/62">{text}</p>
      <Link
        href={href as never}
        className="focus-ring mt-6 inline-flex h-12 items-center justify-center rounded-full bg-leaf px-6 text-sm font-semibold text-white"
      >
        {action}
      </Link>
    </div>
  );
}

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return (
      <EditPageShell title="Редактировать объявление">
        <InfoCard
          title="Не удалось загрузить объявление"
          text="Редактирование объявлений доступно после подключения Supabase."
          href={`/listing/${id}`}
          action="Вернуться к объявлению"
        />
      </EditPageShell>
    );
  }

  const profileResult = await getCurrentProfileResult();

  if (profileResult.status === "unauthenticated") {
    redirect(`/login?next=/listing/${id}/edit`);
  }

  if (profileResult.status === "profile_error") {
    const errorInfo = getSupabaseErrorInfo(profileResult.error);

    return (
      <EditPageShell title="Редактировать объявление">
        <InfoCard
          title="Не удалось загрузить профиль"
          text={
            process.env.NODE_ENV === "production"
              ? "Попробуйте обновить страницу или войти снова."
              : `Ошибка профиля: ${errorInfo?.code ?? "unknown"}`
          }
          href="/profile"
          action="Открыть профиль"
        />
      </EditPageShell>
    );
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const listing = await getListingById(supabase, id);

  if (!listing) {
    return (
      <EditPageShell title="Редактировать объявление">
        <InfoCard
          title="Не удалось загрузить объявление"
          text="Возможно, оно удалено или у вас нет доступа."
          href="/profile"
          action="Вернуться в профиль"
        />
      </EditPageShell>
    );
  }

  if (listing.user_id !== profileResult.user.id) {
    redirect(`/listing/${id}`);
  }

  if (listing.status === "sold" || listing.status === "archived") {
    return (
      <EditPageShell title="Редактировать объявление">
        <InfoCard
          title="Завершённое объявление нельзя редактировать"
          text="Сделка уже завершена, поэтому объявление осталось только в истории."
          href={`/listing/${id}`}
          action="Вернуться к объявлению"
        />
      </EditPageShell>
    );
  }

  const images = [...(listing.listing_images ?? [])]
    .sort((first, second) => (first.position ?? 0) - (second.position ?? 0))
    .map((image, index) => ({
      id: image.id,
      url: image.image_url,
      isPrimary: Boolean(image.is_primary) || index === 0,
      position: image.position ?? index
    }));

  const initialListing: SellFormInitialListing = {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    category: listing.category,
    district: listing.district,
    price: listing.price,
    currency: listing.currency === "usd" ? "usd" : "uzs",
    negotiable: Boolean(listing.negotiable),
    status:
      listing.status === "reserved" || listing.status === "sold" || listing.status === "archived"
        ? listing.status
        : "active",
    images,
    attributes: (listing.listing_attributes ?? []).reduce<Record<string, string>>(
      (acc, attribute) => {
        acc[attribute.attribute_key] = attribute.attribute_value;
        return acc;
      },
      {}
    )
  };

  return (
    <EditPageShell title="Редактировать объявление">
      <SellForm
        mode="edit"
        initialListing={initialListing}
        initialProfile={profileResult.profile}
        cancelHref={`/listing/${id}`}
      />
    </EditPageShell>
  );
}
