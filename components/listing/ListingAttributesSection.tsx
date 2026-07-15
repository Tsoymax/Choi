import {
  formatAttributeValue,
  getAttributeField,
  getAttributeGroups
} from "@/data/listingAttributeConfig";

type ListingAttributesSectionProps = {
  category: string;
  attributes?: Record<string, string>;
};

export function ListingAttributesSection({
  category,
  attributes = {}
}: ListingAttributesSectionProps) {
  const filledAttributes = Object.entries(attributes).filter(([, value]) =>
    value?.trim()
  );

  if (filledAttributes.length === 0) {
    return null;
  }

  const groups = getAttributeGroups(category);
  const knownKeys = new Set(groups.flatMap((group) => group.fields.map((field) => field.key)));
  const unknownAttributes = filledAttributes.filter(([key]) => !knownKeys.has(key));

  return (
    <section className="rounded-[24px] bg-white p-6 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
      <h2 className="text-2xl font-semibold text-ink">Характеристики</h2>
      <div className="mt-5 space-y-6">
        {groups.map((group) => {
          const groupAttributes = group.fields
            .map((field) => ({
              field,
              value: attributes[field.key]
            }))
            .filter((item) => item.value?.trim());

          if (groupAttributes.length === 0) {
            return null;
          }

          return (
            <div key={group.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-leaf">
                {group.title}
              </h3>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                {groupAttributes.map(({ field, value }) => (
                  <div
                    key={field.key}
                    className="rounded-2xl border border-ink/8 bg-mist/45 p-4"
                  >
                    <dt className="text-sm font-medium text-ink/52">{field.label}</dt>
                    <dd className="mt-1 text-base font-semibold text-ink">
                      {formatAttributeValue(category, field.key, value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          );
        })}

        {unknownAttributes.length > 0 ? (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-leaf">
              Дополнительно
            </h3>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              {unknownAttributes.map(([key, value]) => {
                const field = getAttributeField(category, key);
                return (
                  <div
                    key={key}
                    className="rounded-2xl border border-ink/8 bg-mist/45 p-4"
                  >
                    <dt className="text-sm font-medium text-ink/52">
                      {field?.label ?? key}
                    </dt>
                    <dd className="mt-1 text-base font-semibold text-ink">
                      {formatAttributeValue(category, key, value)}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        ) : null}
      </div>
    </section>
  );
}
