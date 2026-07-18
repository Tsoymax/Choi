export type ListingAttributeOption = {
  value: string;
  label: string;
};

export type ListingAttributeField = {
  key: string;
  label: string;
  type: "text" | "number" | "select";
  required?: boolean;
  placeholder?: string;
  unit?: string;
  options?: ListingAttributeOption[];
  dependsOn?: string;
  getOptions?: (values: Record<string, string>) => ListingAttributeOption[];
};

export type ListingAttributeGroup = {
  title: string;
  fields: ListingAttributeField[];
};

export type ListingAttribute = {
  key: string;
  label: string;
  value: string;
  unit?: string;
};

const yesNoOptions = [
  { value: "yes", label: "Да" },
  { value: "no", label: "Нет" }
];

const carBrands = [
  "Chevrolet",
  "Toyota",
  "Hyundai",
  "Kia",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Volkswagen",
  "Honda",
  "Lexus",
  "Nissan",
  "BYD",
  "Tesla",
  "Ford",
  "Mazda",
  "Mitsubishi",
  "Suzuki",
  "LADA",
  "Daewoo",
  "Opel",
  "Peugeot",
  "Renault",
  "Skoda",
  "Subaru",
  "Volvo",
  "Land Rover",
  "Jeep",
  "Porsche",
  "Infiniti",
  "Acura",
  "Genesis",
  "Changan",
  "Geely",
  "Haval",
  "Chery",
  "JAC",
  "GAC",
  "Jetour",
  "Li Auto",
  "Zeekr"
];

const carModelsByBrand: Record<string, string[]> = {
  Chevrolet: ["Cobalt", "Malibu", "Gentra", "Nexia", "Spark", "Tracker", "Tahoe"],
  Toyota: ["Camry", "Corolla", "Prado", "Land Cruiser", "RAV4", "Highlander"],
  Hyundai: ["Elantra", "Sonata", "Tucson", "Santa Fe", "Accent"],
  Kia: ["K5", "Sportage", "Sorento", "Rio", "Carnival"],
  BMW: ["3 Series", "5 Series", "X3", "X5", "X7"],
  "Mercedes-Benz": ["C-Class", "E-Class", "S-Class", "GLC", "GLE"],
  Audi: ["A4", "A6", "Q5", "Q7"],
  Volkswagen: ["Polo", "Jetta", "Tiguan", "Touareg"],
  Honda: ["Civic", "Accord", "CR-V", "Pilot"],
  Lexus: ["ES", "RX", "LX", "NX"],
  Nissan: ["Altima", "X-Trail", "Qashqai", "Patrol"],
  BYD: ["Chazor", "Song Plus", "Han", "Dolphin"],
  Tesla: ["Model 3", "Model Y", "Model S", "Model X"]
};

function toOptions(values: string[]) {
  return values.map((value) => ({ value, label: value }));
}

function getCarModelOptions(values: Record<string, string>) {
  const models = carModelsByBrand[values.brand] ?? [];
  return toOptions(models);
}

export const listingAttributeGroupsByCategory: Record<string, ListingAttributeGroup[]> = {
  auto: [
    {
      title: "Автомобиль",
      fields: [
        { key: "brand", label: "Марка", type: "select", required: true, options: toOptions(carBrands) },
        {
          key: "model",
          label: "Модель",
          type: "select",
          required: true,
          dependsOn: "brand",
          getOptions: getCarModelOptions
        },
        { key: "year", label: "Год выпуска", type: "number", required: true, placeholder: "2020" },
        { key: "mileage", label: "Пробег", type: "number", required: true, unit: "км", placeholder: "85000" },
        {
          key: "fuel",
          label: "Тип топлива",
          type: "select",
          options: toOptions(["Бензин", "Газ", "Дизель", "Гибрид", "Электро"])
        },
        {
          key: "transmission",
          label: "Коробка",
          type: "select",
          options: toOptions(["Автомат", "Механика", "Вариатор", "Робот"])
        },
        {
          key: "drive",
          label: "Привод",
          type: "select",
          options: toOptions(["Передний", "Задний", "Полный"])
        },
        { key: "engine", label: "Объем двигателя", type: "text", placeholder: "2.5" },
        {
          key: "body",
          label: "Тип кузова",
          type: "select",
          options: toOptions(["Седан", "Хэтчбек", "Универсал", "Кроссовер", "Внедорожник", "Минивэн", "Пикап"])
        },
        { key: "color", label: "Цвет", type: "text", placeholder: "Белый" },
        { key: "vin", label: "VIN", type: "text", placeholder: "Необязательно" },
        { key: "customs", label: "Растаможен", type: "select", options: yesNoOptions },
        { key: "bargain", label: "Торг", type: "select", options: yesNoOptions },
        { key: "exchange", label: "Обмен", type: "select", options: yesNoOptions }
      ]
    }
  ],
  "real-estate": [
    {
      title: "Недвижимость",
      fields: [
        { key: "deal_type", label: "Тип", type: "select", options: toOptions(["Продажа", "Аренда"]) },
        { key: "rooms", label: "Количество комнат", type: "number" },
        { key: "area", label: "Площадь", type: "number", unit: "м²" },
        { key: "floor", label: "Этаж", type: "number" },
        { key: "floors_total", label: "Этажность", type: "number" },
        { key: "built_year", label: "Год постройки", type: "number" },
        { key: "balcony", label: "Балкон", type: "select", options: yesNoOptions },
        {
          key: "renovation",
          label: "Ремонт",
          type: "select",
          options: toOptions(["Без ремонта", "Косметический", "Евроремонт"])
        },
        { key: "furniture", label: "Мебель", type: "select", options: yesNoOptions },
        { key: "parking", label: "Парковка", type: "select", options: yesNoOptions }
      ]
    }
  ],
  electronics: [
    {
      title: "Электроника",
      fields: [
        { key: "brand", label: "Бренд", type: "text", placeholder: "Apple" },
        { key: "model", label: "Модель", type: "text", placeholder: "iPhone 14 Pro" },
        {
          key: "condition",
          label: "Состояние",
          type: "select",
          options: toOptions(["Новое", "Отличное", "Хорошее", "Есть следы использования"])
        },
        { key: "memory", label: "Память", type: "text", placeholder: "256 ГБ" },
        { key: "color", label: "Цвет", type: "text" },
        { key: "kit", label: "Комплектация", type: "text" },
        { key: "warranty", label: "Гарантия", type: "select", options: yesNoOptions }
      ]
    }
  ],
  fashion: [
    {
      title: "Одежда и аксессуары",
      fields: [
        { key: "gender", label: "Пол", type: "select", options: toOptions(["Мужской", "Женский", "Унисекс"]) },
        { key: "size", label: "Размер", type: "text" },
        { key: "brand", label: "Бренд", type: "text" },
        { key: "condition", label: "Состояние", type: "text" },
        { key: "color", label: "Цвет", type: "text" },
        { key: "material", label: "Материал", type: "text" }
      ]
    }
  ],
  jobs: [
    {
      title: "Работа",
      fields: [
        { key: "company", label: "Компания", type: "text" },
        { key: "salary", label: "Зарплата", type: "text" },
        {
          key: "employment_type",
          label: "Тип занятости",
          type: "select",
          options: toOptions(["Полная", "Частичная", "Подработка", "Удаленно"])
        },
        { key: "experience", label: "Опыт", type: "text" },
        { key: "schedule", label: "График", type: "text" }
      ]
    }
  ],
  services: [
    {
      title: "Услуги",
      fields: [
        { key: "service_category", label: "Категория", type: "text" },
        { key: "visit", label: "Выезд", type: "select", options: yesNoOptions },
        { key: "service_price", label: "Цена", type: "text" }
      ]
    }
  ],
  home: [
    {
      title: "Для дома",
      fields: [
        { key: "home_category", label: "Категория", type: "text" },
        { key: "material", label: "Материал", type: "text" },
        { key: "condition", label: "Состояние", type: "text" }
      ]
    }
  ],
  business: [
    {
      title: "Для бизнеса",
      fields: [
        { key: "business_category", label: "Категория", type: "text" },
        { key: "manufacturer", label: "Производитель", type: "text" },
        { key: "condition", label: "Состояние", type: "text" }
      ]
    }
  ],
  parts: [
    {
      title: "Запчасти",
      fields: [
        { key: "brand", label: "Марка", type: "select", options: toOptions(carBrands) },
        { key: "model", label: "Модель", type: "select", dependsOn: "brand", getOptions: getCarModelOptions },
        { key: "part_type", label: "Тип запчасти", type: "text" },
        { key: "condition", label: "Состояние", type: "text" }
      ]
    }
  ]
};

export function getAttributeGroups(category: string) {
  return listingAttributeGroupsByCategory[category] ?? [];
}

export function getAttributeField(category: string, key: string) {
  return getAttributeGroups(category)
    .flatMap((group) => group.fields)
    .find((field) => field.key === key);
}

export function formatAttributeValue(
  category: string,
  key: string,
  value: string
) {
  const field = getAttributeField(category, key);
  const optionLabel = field?.options?.find((option) => option.value === value)?.label;
  const displayValue = optionLabel ?? value;
  return field?.unit ? `${displayValue} ${field.unit}` : displayValue;
}
