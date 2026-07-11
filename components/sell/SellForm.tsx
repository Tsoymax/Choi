"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { saveStoredListing } from "@/utils/listings";
import { CategorySelect } from "./CategorySelect";
import { ListingPreview } from "./ListingPreview";
import { LocationSelect } from "./LocationSelect";
import { PhotoUploader, type UploadPhoto } from "./PhotoUploader";
import { PriceField } from "./PriceField";

type FormErrors = Partial<Record<
  "photos" | "category" | "title" | "description" | "price" | "district" | "name" | "phone",
  string
>>;

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function SellForm() {
  const router = useRouter();
  const [photos, setPhotos] = useState<UploadPhoto[]>([]);
  const [mainPhotoId, setMainPhotoId] = useState("");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<"uzs" | "usd">("uzs");
  const [negotiable, setNegotiable] = useState(false);
  const [district, setDistrict] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const photosRef = useRef<UploadPhoto[]>([]);

  const mainPhoto = useMemo(
    () => photos.find((photo) => photo.id === mainPhotoId) ?? photos[0],
    [mainPhotoId, photos]
  );

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    };
  }, []);

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
    setErrors((current) => ({ ...current, photos: undefined }));
  }

  function removePhoto(photoId: string) {
    setPhotos((current) => {
      const removedPhoto = current.find((photo) => photo.id === photoId);
      if (removedPhoto) {
        URL.revokeObjectURL(removedPhoto.previewUrl);
      }

      const updated = current.filter((photo) => photo.id !== photoId);
      if (photoId === mainPhotoId) {
        setMainPhotoId(updated[0]?.id ?? "");
      }
      return updated;
    });
  }

  function validateForm() {
    const nextErrors: FormErrors = {};

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
    if (!name.trim()) {
      nextErrors.name = "Введите имя.";
    }
    if (!phone.trim()) {
      nextErrors.phone = "Введите номер телефона.";
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
    const image = await fileToDataUrl(mainPhoto.file);

    saveStoredListing({
      title: title.trim(),
      description: description.trim(),
      category,
      district,
      price: negotiable ? null : Number(price),
      currency,
      negotiable,
      seller: name.trim(),
      phone: phone.trim(),
      image
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
          onMainPhotoChange={setMainPhotoId}
        />

        <section className="space-y-6 rounded-[24px] bg-white p-5 shadow-[0_18px_60px_rgba(24,32,29,0.08)] sm:p-7">
          <CategorySelect
            value={category}
            error={errors.category}
            onChange={(value) => {
              setCategory(value);
              setErrors((current) => ({ ...current, category: undefined }));
            }}
          />

          <label className="block">
            <span className="text-sm font-semibold text-ink">Название объявления</span>
            <input
              value={title}
              maxLength={70}
              onChange={(event) => {
                setTitle(event.target.value);
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

          <label className="block">
            <span className="text-sm font-semibold text-ink">Описание</span>
            <textarea
              value={description}
              maxLength={3000}
              onChange={(event) => {
                setDescription(event.target.value);
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

          <PriceField
            price={price}
            currency={currency}
            negotiable={negotiable}
            error={errors.price}
            onPriceChange={(value) => {
              setPrice(value);
              setErrors((current) => ({ ...current, price: undefined }));
            }}
            onCurrencyChange={setCurrency}
            onNegotiableChange={(value) => {
              setNegotiable(value);
              setErrors((current) => ({ ...current, price: undefined }));
            }}
          />

          <LocationSelect
            value={district}
            error={errors.district}
            onChange={(value) => {
              setDistrict(value);
              setErrors((current) => ({ ...current, district: undefined }));
            }}
          />
        </section>

        <section className="space-y-5 rounded-[24px] bg-white p-5 shadow-[0_18px_60px_rgba(24,32,29,0.08)] sm:p-7">
          <h2 className="text-xl font-semibold text-ink">Контакты</h2>
          <label className="block">
            <span className="text-sm font-semibold text-ink">Имя</span>
            <input
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setErrors((current) => ({ ...current, name: undefined }));
              }}
              className="focus-ring mt-2 h-14 w-full rounded-2xl border border-ink/10 bg-white px-4 text-base font-medium text-ink shadow-sm"
              placeholder="Ваше имя"
            />
            {errors.name ? <p className="mt-2 text-sm font-medium text-coral">{errors.name}</p> : null}
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-ink">Номер телефона</span>
            <input
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
                setErrors((current) => ({ ...current, phone: undefined }));
              }}
              className="focus-ring mt-2 h-14 w-full rounded-2xl border border-ink/10 bg-white px-4 text-base font-medium text-ink shadow-sm"
              placeholder="+998 90 123 45 67"
            />
            {errors.phone ? <p className="mt-2 text-sm font-medium text-coral">{errors.phone}</p> : null}
          </label>
        </section>

        <button
          type="submit"
          disabled={isSubmitting}
          className="focus-ring h-16 w-full rounded-full bg-leaf px-8 text-lg font-semibold text-white shadow-lg shadow-leaf/20 transition hover:bg-[#3f6d4d] disabled:cursor-wait disabled:opacity-70"
        >
          {isSubmitting ? "Публикуем..." : "Опубликовать"}
        </button>
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
