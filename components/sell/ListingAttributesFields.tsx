import {
  getAttributeGroups,
  type ListingAttributeField
} from "@/data/listingAttributeConfig";

type ListingAttributesFieldsProps = {
  category: string;
  values: Record<string, string>;
  errors?: Record<string, string>;
  onChange: (key: string, value: string) => void;
};

function FieldControl({
  field,
  values,
  value,
  error,
  onChange
}: {
  field: ListingAttributeField;
  values: Record<string, string>;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const options = field.getOptions ? field.getOptions(values) : field.options;
  const isSelectDisabled = field.type === "select" && field.dependsOn && !values[field.dependsOn];

  return (
    <label id={`sell-field-attribute-${field.key}`} className="block scroll-mt-28">
      <span className="text-sm font-semibold text-ink">
        {field.label}
        {field.required ? <span className="text-coral"> *</span> : null}
      </span>
      {field.type === "select" ? (
        <select
          value={value}
          disabled={Boolean(isSelectDisabled)}
          onChange={(event) => onChange(event.target.value)}
          className="focus-ring mt-2 h-14 w-full rounded-2xl border border-ink/10 bg-white px-4 text-base font-medium text-ink shadow-sm disabled:bg-mist disabled:text-ink/40"
        >
          <option value="">
            {isSelectDisabled ? "Сначала выберите марку" : "Выберите"}
          </option>
          {(options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="relative mt-2">
          <input
            type={field.type === "number" ? "number" : "text"}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="focus-ring h-14 w-full rounded-2xl border border-ink/10 bg-white px-4 text-base font-medium text-ink shadow-sm"
            placeholder={field.placeholder}
          />
          {field.unit ? (
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink/45">
              {field.unit}
            </span>
          ) : null}
        </div>
      )}
      {error ? <span className="mt-2 block text-sm font-medium text-coral">{error}</span> : null}
    </label>
  );
}

export function ListingAttributesFields({
  category,
  values,
  errors = {},
  onChange
}: ListingAttributesFieldsProps) {
  const groups = getAttributeGroups(category);

  if (!category || groups.length === 0) {
    return null;
  }

  return (
    <div className="space-y-5 rounded-[20px] border border-ink/10 bg-mist/55 p-4 sm:p-5">
      <div>
        <h2 className="text-xl font-semibold text-ink">Характеристики</h2>
        <p className="mt-1 text-sm text-ink/58">
          Поля меняются автоматически в зависимости от категории.
        </p>
      </div>

      {groups.map((group) => (
        <div key={group.title} className="space-y-4">
          <h3 className="text-base font-semibold text-leaf">{group.title}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {group.fields.map((field) => (
              <FieldControl
                key={field.key}
                field={field}
                values={values}
                value={values[field.key] ?? ""}
                error={errors[field.key]}
                onChange={(value) => onChange(field.key, value)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

