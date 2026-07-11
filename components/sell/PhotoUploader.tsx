import Image from "next/image";
import { Camera, Star, Trash2, Upload } from "lucide-react";

export type UploadPhoto = {
  id: string;
  file: File;
  previewUrl: string;
};

type PhotoUploaderProps = {
  photos: UploadPhoto[];
  mainPhotoId: string;
  error?: string;
  onAddPhotos: (files: FileList | null) => void;
  onRemovePhoto: (photoId: string) => void;
  onMainPhotoChange: (photoId: string) => void;
};

export function PhotoUploader({
  photos,
  mainPhotoId,
  error,
  onAddPhotos,
  onRemovePhoto,
  onMainPhotoChange
}: PhotoUploaderProps) {
  return (
    <section className="rounded-[24px] bg-white p-5 shadow-[0_18px_60px_rgba(24,32,29,0.08)] sm:p-7">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-ink">Добавьте фотографии</h2>
          <p className="mt-1 text-sm text-ink/58">
            До 10 фото. Первая фотография считается главной.
          </p>
        </div>
        <Camera className="text-leaf" size={24} />
      </div>

      <label className="focus-within:ring-2 focus-within:ring-leaf focus-within:ring-offset-2 flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-leaf/24 bg-mist/55 p-6 text-center transition hover:border-leaf/42 hover:bg-mist">
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(event) => {
            onAddPhotos(event.target.files);
            event.target.value = "";
          }}
        />
        <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-leaf shadow-sm">
          <Upload size={24} />
        </span>
        <span className="mt-4 text-lg font-semibold text-ink">Добавьте фотографии</span>
        <span className="mt-1 text-sm text-ink/58">До 10 фото</span>
      </label>

      {photos.length > 0 ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {photos.map((photo, index) => {
            const isMain = photo.id === mainPhotoId;

            return (
              <div
                key={photo.id}
                className={`relative overflow-hidden rounded-2xl border bg-white ${
                  isMain ? "border-leaf ring-2 ring-leaf/20" : "border-ink/10"
                }`}
              >
                <div className="relative aspect-square">
                  <Image
                    src={photo.previewUrl}
                    alt={`Фото ${index + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="absolute left-2 top-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onMainPhotoChange(photo.id)}
                    className={`focus-ring grid h-9 w-9 place-items-center rounded-full shadow-sm ${
                      isMain ? "bg-leaf text-white" : "bg-white/90 text-ink"
                    }`}
                    aria-label="Сделать главным фото"
                  >
                    <Star size={17} className={isMain ? "fill-white" : ""} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => onRemovePhoto(photo.id)}
                  className="focus-ring absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink shadow-sm transition hover:text-coral"
                  aria-label="Удалить фото"
                >
                  <Trash2 size={17} />
                </button>
                {isMain ? (
                  <span className="absolute bottom-2 left-2 rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-leaf shadow-sm">
                    Главное
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm font-medium text-coral">{error}</p> : null}
    </section>
  );
}
