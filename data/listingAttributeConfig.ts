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
  min?: number;
  max?: number;
  step?: number;
  maxLength?: number;
  options?: ListingAttributeOption[];
  suggestions?: ListingAttributeOption[];
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

const carMonthOptions = Array.from({ length: 12 }, (_, index) => {
  const month = String(index + 1).padStart(2, "0");
  return { value: month, label: month };
});

const carYearSuggestions = Array.from({ length: 128 }, (_, index) => {
  const year = String(2027 - index);
  return { value: year, label: year };
});

const carMileageSuggestions = [
  "0",
  "5000",
  "10000",
  "20000",
  "30000",
  "50000",
  "80000",
  "100000",
  "150000",
  "200000",
  "300000",
  "500000",
  "800000"
];

const carEngineSuggestions = [
  "0.8",
  "1.0",
  "1.2",
  "1.4",
  "1.5",
  "1.6",
  "1.8",
  "2.0",
  "2.2",
  "2.4",
  "2.5",
  "3.0",
  "3.5",
  "4.0",
  "4.5",
  "5.0",
  "6.0"
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

const electronicsBrands = [
  "Apple",
  "Samsung",
  "Xiaomi",
  "Redmi",
  "Poco",
  "Huawei",
  "Honor",
  "OnePlus",
  "Google",
  "Sony",
  "LG",
  "Nokia",
  "Motorola",
  "Realme",
  "Vivo",
  "OPPO",
  "Tecno",
  "Infinix",
  "Lenovo",
  "HP",
  "Dell",
  "ASUS",
  "Acer",
  "MSI"
];

const electronicsModelsByBrand: Record<string, string[]> = {
  Apple: [
    "iPhone 16 Pro Max",
    "iPhone 16 Pro",
    "iPhone 16",
    "iPhone 15 Pro Max",
    "iPhone 15 Pro",
    "iPhone 15",
    "iPhone 14 Pro Max",
    "iPhone 14 Pro",
    "iPhone 14",
    "iPhone 13 Pro Max",
    "iPhone 13 Pro",
    "iPhone 13",
    "MacBook Air",
    "MacBook Pro",
    "iPad Pro",
    "iPad Air",
    "AirPods Pro"
  ],
  Samsung: [
    "Galaxy S25 Ultra",
    "Galaxy S25",
    "Galaxy S24 Ultra",
    "Galaxy S24",
    "Galaxy S23 Ultra",
    "Galaxy S23",
    "Galaxy A55",
    "Galaxy A35",
    "Galaxy Z Fold",
    "Galaxy Z Flip",
    "Galaxy Tab"
  ],
  Xiaomi: ["14 Ultra", "14", "13T Pro", "13T", "12 Pro", "Mi 11", "Pad 6"],
  Redmi: ["Note 13 Pro", "Note 13", "Note 12 Pro", "Note 12", "12C", "13C"],
  Poco: ["F6 Pro", "F6", "X6 Pro", "X6", "M6 Pro"],
  Huawei: ["Pura 70", "P60 Pro", "Mate 60 Pro", "Nova 12", "MateBook"],
  Honor: ["Magic6 Pro", "Magic5 Pro", "X9b", "X8a", "Pad"],
  OnePlus: ["12", "11", "10 Pro", "Nord 4", "Nord CE"],
  Google: ["Pixel 9 Pro", "Pixel 9", "Pixel 8 Pro", "Pixel 8", "Pixel 7"],
  Sony: ["Xperia 1", "Xperia 5", "PlayStation 5", "PlayStation 4"],
  LG: ["TV OLED", "TV NanoCell", "Monitor UltraGear"],
  Nokia: ["G42", "G22", "C32", "105"],
  Motorola: ["Edge 50", "Edge 40", "G84", "G54"],
  Realme: ["GT 6", "12 Pro", "12", "C67", "C55"],
  Vivo: ["V30", "V29", "Y36", "Y27"],
  OPPO: ["Reno 12", "Reno 11", "A78", "A58"],
  Tecno: ["Camon 30", "Spark 20", "Pova 6"],
  Infinix: ["Note 40", "Hot 40", "Zero 30"],
  Lenovo: ["ThinkPad", "IdeaPad", "Legion", "Tab"],
  HP: ["Pavilion", "Envy", "EliteBook", "Victus", "Omen"],
  Dell: ["XPS", "Inspiron", "Latitude", "Alienware"],
  ASUS: ["ZenBook", "VivoBook", "ROG", "TUF"],
  Acer: ["Aspire", "Swift", "Nitro", "Predator"],
  MSI: ["Modern", "Prestige", "Katana", "Raider"]
};

function getElectronicsModelOptions(values: Record<string, string>) {
  const models = electronicsModelsByBrand[values.brand] ?? [];
  return toOptions(models);
}

const electronicsMemoryOptions = toOptions([
  "16 ГБ",
  "32 ГБ",
  "64 ГБ",
  "128 ГБ",
  "256 ГБ",
  "512 ГБ",
  "1 ТБ",
  "2 ТБ"
]);

const electronicsColorOptions = toOptions([
  "Белый",
  "Черный",
  "Серый",
  "Серебристый",
  "Золотой",
  "Синий",
  "Голубой",
  "Зеленый",
  "Красный",
  "Розовый",
  "Фиолетовый",
  "Желтый",
  "Комбинированный"
]);

const carColorOptions = toOptions([
  "Белый",
  "Черный",
  "Серый",
  "Серебристый",
  "Синий",
  "Голубой",
  "Красный",
  "Бордовый",
  "Зеленый",
  "Темно-зеленый",
  "Желтый",
  "Оранжевый",
  "Коричневый",
  "Бежевый",
  "Золотистый",
  "Фиолетовый",
  "Розовый",
  "Комбинированный"
]);

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
        { key: "year", label: "Год выпуска", type: "number", required: true, placeholder: "Выберите", min: 1900, max: 2027, step: 1, maxLength: 4, suggestions: carYearSuggestions },
        { key: "month", label: "Месяц выпуска", type: "select", required: true, options: carMonthOptions },
        { key: "mileage", label: "Пробег", type: "number", required: true, unit: "км", placeholder: "Выберите", min: 0, max: 3000000, step: 1000, maxLength: 7, suggestions: toOptions(carMileageSuggestions) },
        {
          key: "fuel",
          label: "Тип топлива",
          type: "select",
          required: true,
          options: toOptions([
            "Бензин",
            "Бензин-Метан",
            "Бензин-Пропан",
            "Дизель",
            "Электро",
            "Гибрид"
          ])
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
        { key: "engine", label: "Объем двигателя", type: "number", placeholder: "Выберите", min: 0, max: 6, step: 0.1, maxLength: 4, suggestions: toOptions(carEngineSuggestions) },
        { key: "color", label: "Цвет", type: "select", options: carColorOptions },
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
        { key: "rooms", label: "Количество комнат", type: "number", required: true },
        { key: "area", label: "Площадь", type: "number", required: true, unit: "м²" },
        { key: "floor", label: "Этаж", type: "number", required: true },
        { key: "floors_total", label: "Этажность", type: "number", required: true },
        { key: "built_year", label: "Год постройки", type: "number" },
        { key: "balcony", label: "Балкон", type: "select", options: yesNoOptions },
        {
          key: "renovation",
          label: "Ремонт",
          type: "select",
          options: toOptions(["Без ремонта", "Косметический", "Евроремонт"])
        },
        { key: "furniture", label: "Мебель", type: "select", options: yesNoOptions }
      ]
    }
  ],
  electronics: [
    {
      title: "Электроника",
      fields: [
        { key: "brand", label: "Бренд", type: "select", options: toOptions(electronicsBrands) },
        {
          key: "model",
          label: "Модель",
          type: "select",
          dependsOn: "brand",
          getOptions: getElectronicsModelOptions
        },
        {
          key: "condition",
          label: "Состояние",
          type: "select",
          options: toOptions(["Новое", "Отличное", "Хорошее", "Есть следы использования"])
        },
        { key: "memory", label: "Память", type: "select", options: electronicsMemoryOptions },
        { key: "color", label: "Цвет", type: "select", options: electronicsColorOptions }
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
