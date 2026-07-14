"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { saveStoredListing, updateStoredListing } from "@/utils/listings";
import { hasSupabaseBrowserEnv, getCurrentUser } from "@/lib/auth/client";
import {
  createListingWithImages,
  syncListingImages,
  updateListing as updateRemoteListing
} from "@/lib/data/listings";
import { getCurrentUser as getFallbackCurrentUser } from "@/utils/users";
import type { ProfileRow } from "@/lib/data/profiles";
import { getDistrictCoordinate } from "@/data/districtCoordinates";
import { CategorySelect } from "./CategorySelect";
import { ListingPreview } from "./ListingPreview";
import { LocationSelect } from "./LocationSelect";
import { PhotoUploader, type UploadPhoto } from "./PhotoUploader";
import { PriceField } from "./PriceField";

type FormErrors = Partial<
  Record<
    "photos" | "category" | "title" | "description" | "price" | "district" | "profile",
    string
  >
>;

export type SellFormInitialListing = {
  id: string;
  title: string;
  description: string;
  category: string;
  district: string;
  price: number | null;
  currency: "uzs" | "usd";
  negotiable: boolean;
  status: "active" | "reserved" | "sold" | "archived";
  images: Array<{
    id: string;
    url: string;
    isPrimary: boolean;
    position: number;
  }>;
};

type SellFormProps = {
  mode?: "create" | "edit";
  initialListing?: SellFormInitialListing | null;
  initialProfile?: ProfileRow | null;
  profileError?: string;
  cancelHref?: string;
};

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function SellForm({
  mode = "create",
  initialListing = null,
  initialProfile = null,
  profileError = "",
  cancelHref = "/"
}: SellFormProps) {
  const router = useRouter();
  const isEditMode = mode === "edit" && Boolean(initialListing);
  const [photos, setPhotos] = useState<UploadPhoto[]>([]);
  const [mainPhotoId, setMainPhotoId] = useState("");
  const [category, setCategory] = useState(initialListing?.category ?? "");
  const [title, setTitle] = useState(initialListing?.title ?? "");
  const [description, setDescription] = useState(initialListing?.description ?? "");
  const [price, setPrice] = useState(
    initialListing?.price === null || initialListing?.price === undefined
      ? ""
      : String(initialListing.price)
  );
  const [currency, setCurrency] = useState<"uzs" | "usd">(
    initialListing?.currency ?? "uzs"
  );
  const [negotiable, setNegotiable] = useState(initialListing?.negotiable ?? false);
  const [district, setDistrict] = useState(
    initialListing?.district ?? initialProfile?.district ?? ""
  );
  const [sellerName, setSellerName] = useState(initialProfile?.name ?? "");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isProfileLoading] = useState(false);
  const [profileLoadError] = useState(profileError);
  const photosRef = useRef<UploadPhoto[]>([]);
  const initialPhotoIdsRef = useRef(initialListing?.images.map((image) => image.id) ?? []);

  const mainPhoto = useMemo(
    () => photos.find((photo) => photo.id === mainPhotoId) ?? photos[0],
    [mainPhotoId, photos]
  );

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    if (!initialProfile && !profileError) {
      const fallbackUser = getFallbackCurrentUser();
      setSellerName(fallbackUser.name);
      setDistrict(fallbackUser.district);
    }
  }, [initialProfile, profileError]);

  useEffect(() => {
    if (!initialListing) {
      return;
    }

    const sortedImages = [...initialListing.images].sort(
      (first, second) => first.position - second.position
    );

    setPhotos(
      sortedImages.map((image) => ({
        id: image.id,
        existingId: image.id,
        existingUrl: image.url,
        previewUrl: image.url
      }))
    );
    setMainPhotoId(
      sortedImages.find((image) => image.isPrimary)?.id ?? sortedImages[0]?.id ?? ""
    );
  }, [initialListing]);

  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => {
        if (photo.file) {
          URL.revokeObjectURL(photo.previewUrl);
        }
      });
    };
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty, isEditMode]);

  function markDirty() {
    if (isEditMode) {
      setIsDirty(true);
    }
  }

  function addPhotos(files: FileList | null) {
    if (!files) {
      return;
    }

    const remainingSlots = 10 - photos.length;
    const selectedFiles = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, remainingSlots);

    const nextPhotos = selectedFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    setPhotos((current) => {
      const updated = [...current, ...nextPhotos];
      if (!mainPhotoId && updated[0]) {
        setMainPhotoId(updated[0].id);
      }
      return updated;
    });
    markDirty();
    setErrors((current) => ({ ...current, photos: undefined }));
  }

  function removePhoto(photoId: string) {
    setPhotos((current) => {
      const removedPhoto = current.find((photo) => photo.id === photoId);
      if (removedPhoto?.file) {
        URL.revokeObjectURL(removedPhoto.previewUrl);
      }

      const updated = current.filter((photo) => photo.id !== photoId);
      if (photoId === mainPhotoId) {
        setMainPhotoId(updated[0]?.id ?? "");
      }
      return updated;
    });
    markDirty();
  }

  function movePhoto(photoId: string, direction: "left" | "right") {
    setPhotos((current) => {
      const index = current.findIndex((photo) => photo.id === photoId);
      const nextIndex = direction === "left" ? index - 1 : index + 1;

      if (index === -1 || nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const updated = [...current];
      const [photo] = updated.splice(index, 1);
      updated.splice(nextIndex, 0, photo);
      return updated;
    });
    markDirty();
  }

  function changeMainPhoto(photoId: string) {
    setMainPhotoId(photoId);
    markDirty();
  }

  function confirmCancel(event: MouseEvent<HTMLAnchorElement>) {
    if (!isEditMode || !isDirty) {
      return;
    }

    if (!window.confirm("Изменения не сохранены. Выйти?")) {
      event.preventDefault();
    }
  }

  function validateForm() {
    const nextErrors: FormErrors = {};

    if (isProfileLoading) {
      nextErrors.profile = "Подождите, профиль ещё загружается.";
      setErrors(nextErrors);
      return false;
    }

    if (profileLoadError) {
      nextErrors.profile = "Не удалось загрузить профиль.";
      setErrors(nextErrors);
      return false;
    }

    if (photos.length === 0) {
      nextErrors.photos = "Добавьте минимум 1 фото.";
    }
    if (!category) {
      nextErrors.category = "Выберите категорию.";
    }
    if (!title.trim()) {
      nextErrors.title = "Введите название объявления.";
    }
    if (!description.trim()) {
      nextErrors.description = "Добавьте описание.";
    }
    if (!negotiable && !price) {
      nextErrors.price = "Укажите цену или выберите «Договорная».";
    }
    if (!district) {
      nextErrors.district = "Выберите район.";
    }
    if (!sellerName.trim()) {
      nextErrors.profile = "Сначала укажите имя в профиле.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submitListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm() || !mainPhoto) {
      return;
    }

    setIsSubmitting(true);

    const imagePairs = await Promise.all(
      photos.map(async (photo, index) => ({
        id: photo.id,
        existingId: photo.existingId,
        image: photo.file ? await fileToDataUrl(photo.file) : photo.existingUrl ?? photo.previewUrl,
        position: index,
        isPrimary: photo.id === mainPhoto.id
      }))
    );
    const mainImage =
      imagePairs.find((item) => item.id === mainPhoto.id)?.image ?? imagePairs[0].image;
    const galleryImages = [
      mainImage,
      ...imagePairs.filter((item) => item.image !== mainImage).map((item) => item.image)
    ];

    const districtCoordinates = getDistrictCoordinate(district);

    if (hasSupabaseBrowserEnv()) {
      const user = await getCurrentUser();

      if (!user) {
        router.push("/login?next=/sell" as never);
        return;
      }

      const supabase = createClient();
      if (isEditMode && initialListing) {
        const listingResult = await updateRemoteListing(supabase, initialListing.id, {
          title: title.trim(),
          description: description.trim(),
          category,
          district,
          latitude: districtCoordinates.latitude,
          longitude: districtCoordinates.longitude,
          price: negotiable ? null : Number(price),
          currency,
          negotiable
        });

        if (listingResult.error) {
          setErrors((current) => ({
            ...current,
            profile: "Не удалось сохранить изменения. Попробуйте снова."
          }));
          setIsSubmitting(false);
          return;
        }

        const remainingExistingIds = new Set(
          imagePairs.map((image) => image.existingId).filter(Boolean)
        );
        const removedImages = initialListing.images
          .filter((image) => initialPhotoIdsRef.current.includes(image.id))
          .filter((image) => !remainingExistingIds.has(image.id))
          .map((image) => ({
            id: image.id,
            listing_id: initialListing.id,
            image_url: image.url,
            position: image.position,
            is_primary: image.isPrimary,
            created_at: null
          }));

        const imageResult = await syncListingImages(
          supabase,
          initialListing.id,
          imagePairs.map((image) => ({
            id: image.existingId,
            imageUrl: image.image,
            position: image.position,
            isPrimary: image.isPrimary
          })),
          removedImages
        );

        if (imageResult.error) {
          setErrors((current) => ({
            ...current,
            profile:
              "Некоторые фотографии не обновились. Проверьте объявление и попробуйте снова."
          }));
          setIsSubmitting(false);
          return;
        }

        setIsDirty(false);
        router.push(`/listing/${initialListing.id}?updated=1` as never);
        router.refresh();
        return;
      }

      const result = await createListingWithImages(supabase, {
        userId: user.id,
        title: title.trim(),
        description: description.trim(),
        category,
        district,
        latitude: districtCoordinates.latitude,
        longitude: districtCoordinates.longitude,
        price: negotiable ? null : Number(price),
        currency,
        negotiable,
        images: galleryImages
      });

      if (result.error || !result.listing) {
        setErrors((current) => ({
          ...current,
          profile:
            "Не удалось опубликовать объявление. Проверьте SQL-права Supabase и попробуйте снова."
        }));
        setIsSubmitting(false);
        return;
      }

      router.push(`/listing/${result.listing.id}` as never);
      router.refresh();
      return;
    }

    if (isEditMode && initialListing) {
      updateStoredListing(initialListing.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        district,
        latitude: districtCoordinates.latitude,
        longitude: districtCoordinates.longitude,
        price: negotiable ? null : Number(price),
        currency,
        negotiable,
        image: mainImage,
        images: galleryImages
      });

      setIsDirty(false);
      router.push(`/listing/${initialListing.id}` as never);
      return;
    }

    saveStoredListing({
      title: title.trim(),
      description: description.trim(),
      category,
      district,
      latitude: districtCoordinates.latitude,
      longitude: districtCoordinates.longitude,
      price: negotiable ? null : Number(price),
      currency,
      negotiable,
      seller: sellerName.trim(),
      phone: "",
      image: mainImage,
      images: galleryImages
    });

    router.push("/");
  }

  return (
    <form
      onSubmit={submitListing}
      className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]"
    >
      <div className="space-y-6">
        <PhotoUploader
          photos={photos}
          mainPhotoId={mainPhotoId}
          error={errors.photos}
          onAddPhotos={addPhotos}
          onRemovePhoto={removePhoto}
          onMainPhotoChange={changeMainPhoto}
          onMovePhoto={movePhoto}
        />

        <section className="space-y-6 rounded-[24px] bg-white p-5 shadow-[0_18px_60px_rgba(24,32,29,0.08)] sm:p-7">
          <label className="block">
            <span className="text-sm font-semibold text-ink">Название объявления</span>
            <input
              value={title}
              maxLength={70}
              onChange={(event) => {
                setTitle(event.target.value);
                markDirty();
                setErrors((current) => ({ ...current, title: undefined }));
              }}
              className="focus-ring mt-2 h-14 w-full rounded-2xl border border-ink/10 bg-white px-4 text-base font-medium text-ink shadow-sm"
              placeholder="Например, iPhone 14 Pro 256 ГБ"
            />
            <span className="mt-2 flex items-center justify-between text-sm">
              <span className="font-medium text-coral">{errors.title}</span>
              <span className="ml-auto text-ink/45">{title.length}/70</span>
            </span>
          </label>

          <CategorySelect
            value={category}
            error={errors.category}
            onChange={(value) => {
              setCategory(value);
              markDirty();
              setErrors((current) => ({ ...current, category: undefined }));
            }}
          />

          <PriceField
            price={price}
            currency={currency}
            negotiable={negotiable}
            error={errors.price}
            onPriceChange={(value) => {
              setPrice(value);
              markDirty();
              setErrors((current) => ({ ...current, price: undefined }));
            }}
            onCurrencyChange={(value) => {
              setCurrency(value);
              markDirty();
            }}
            onNegotiableChange={(value) => {
              setNegotiable(value);
              markDirty();
              setErrors((current) => ({ ...current, price: undefined }));
            }}
          />

          <label className="block">
            <span className="text-sm font-semibold text-ink">Описание</span>
            <textarea
              value={description}
              maxLength={3000}
              onChange={(event) => {
                setDescription(event.target.value);
                markDirty();
                setErrors((current) => ({ ...current, description: undefined }));
              }}
              className="focus-ring mt-2 min-h-[180px] w-full resize-y rounded-2xl border border-ink/10 bg-white px-4 py-4 text-base font-medium text-ink shadow-sm"
              placeholder="Опишите товар, состояние и важные детали"
            />
            <span className="mt-2 flex items-center justify-between text-sm">
              <span className="font-medium text-coral">{errors.description}</span>
              <span className="ml-auto text-ink/45">{description.length}/3000</span>
            </span>
          </label>

          <LocationSelect
            value={district}
            error={errors.district}
            onChange={(value) => {
              setDistrict(value);
              markDirty();
              setErrors((current) => ({ ...current, district: undefined }));
            }}
          />
        </section>

        <section className="space-y-5 rounded-[24px] bg-white p-5 shadow-[0_18px_60px_rgba(24,32,29,0.08)] sm:p-7">
          <h2 className="text-xl font-semibold text-ink">Продавец</h2>
          <div className="rounded-2xl border border-ink/10 bg-mist p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-ink/58">
                  Объявление будет опубликовано от имени
                </p>
                <p className="mt-1 text-xl font-semibold text-ink">
                  {isProfileLoading ? "Загружаем..." : sellerName || "Имя не указано"}
                </p>
              </div>
              <Link
                href="/profile"
                className="focus-ring inline-flex h-10 items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-leaf shadow-sm"
              >
                Изменить в профиле
              </Link>
            </div>
            {profileLoadError ? (
              <p className="mt-4 rounded-2xl bg-[#fff2ef] p-4 text-sm font-semibold text-coral">
                {profileLoadError}
              </p>
            ) : null}
            {!profileLoadError && errors.profile ? (
              <div className="mt-4 rounded-2xl bg-[#fff2ef] p-4">
                <p className="text-sm font-semibold text-coral">{errors.profile}</p>
                <Link
                  href="/profile"
                  className="focus-ring mt-3 inline-flex h-10 items-center rounded-full bg-leaf px-4 text-sm font-semibold text-white"
                >
                  Перейти в профиль
                </Link>
              </div>
            ) : null}
          </div>
          <p className="text-sm leading-6 text-ink/58">
            Покупатели будут связываться с вами через Choi Chat. Телефон в объявлении не
            показывается.
          </p>
        </section>

        <div className="sticky bottom-[calc(86px+env(safe-area-inset-bottom))] z-20 grid gap-3 rounded-[24px] bg-white/92 p-3 shadow-[0_18px_60px_rgba(24,32,29,0.12)] backdrop-blur md:static md:bg-transparent md:p-0 md:shadow-none">
          <button
            type="submit"
            disabled={isSubmitting}
            className="focus-ring h-16 w-full rounded-full bg-leaf px-8 text-lg font-semibold text-white shadow-lg shadow-leaf/20 transition hover:bg-[#3f6d4d] disabled:cursor-wait disabled:opacity-70"
          >
            {isSubmitting
              ? isEditMode
                ? "Сохраняем..."
                : "Публикуем..."
              : isEditMode
                ? "Сохранить изменения"
                : "Опубликовать"}
          </button>
          {isEditMode ? (
            <Link
              href={cancelHref as never}
              onClick={confirmCancel}
              className="focus-ring inline-flex h-12 items-center justify-center rounded-full border border-ink/10 bg-white px-6 text-sm font-semibold text-ink transition hover:border-leaf/30"
            >
              Отмена
            </Link>
          ) : null}
        </div>
      </div>

      <ListingPreview
        title={title}
        price={price}
        currency={currency}
        negotiable={negotiable}
        district={district}
        image={mainPhoto?.previewUrl}
      />
    </form>
  );
}
