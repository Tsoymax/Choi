export const sellCategories = [
  { id: "auto", label: "Транспорт" },
  { id: "real-estate", label: "Недвижимость" },
  { id: "electronics", label: "Электроника" },
  { id: "fashion", label: "Одежда, обувь и аксессуары" },
  { id: "jobs", label: "Работа и подработка" },
  { id: "services", label: "Услуги" },
  { id: "parts", label: "Все для авто" },
  { id: "home", label: "Для дома" },
  { id: "business", label: "Для бизнеса" }
];

export const sellSubcategoriesByCategory: Record<
  string,
  Array<{ id: string; label: string }>
> = {
  auto: [
    { id: "passenger-cars", label: "Легковые авто" },
    { id: "electric-cars", label: "Электромобили" },
    { id: "motorcycles", label: "Мототехника" },
    { id: "trucks", label: "Грузовики" },
    { id: "buses", label: "Автобусы" },
    { id: "trailers", label: "Прицепы" },
    { id: "car-rental", label: "Аренда авто" }
  ],
  "real-estate": [
    { id: "apartments", label: "Квартиры" },
    { id: "houses", label: "Дома" },
    { id: "land", label: "Участки" },
    { id: "commercial", label: "Коммерческая недвижимость" },
    { id: "new-buildings", label: "Новостройки" },
    { id: "rooms", label: "Комнаты" },
    { id: "garages", label: "Гаражи" }
  ],
  electronics: [
    { id: "smartphones", label: "Смартфоны" },
    { id: "laptops", label: "Ноутбуки" },
    { id: "computers", label: "Компьютеры" },
    { id: "tv", label: "Телевизоры" },
    { id: "headphones", label: "Наушники" },
    { id: "tablets", label: "Планшеты" },
    { id: "game-consoles", label: "Игровые приставки" },
    { id: "photo-video", label: "Фото и видео" }
  ],
  fashion: [
    { id: "women", label: "Женская одежда" },
    { id: "men", label: "Мужская одежда" },
    { id: "kids", label: "Детская одежда" },
    { id: "shoes", label: "Обувь" },
    { id: "bags", label: "Сумки" },
    { id: "accessories", label: "Аксессуары" },
    { id: "watches", label: "Часы" }
  ],
  jobs: [
    { id: "vacancies", label: "Вакансии" },
    { id: "part-time", label: "Подработка" },
    { id: "couriers", label: "Курьеры" },
    { id: "sales", label: "Продажи" },
    { id: "food-service", label: "Общепит" },
    { id: "construction", label: "Строительство" },
    { id: "remote", label: "Удалённая работа" }
  ],
  services: [
    { id: "repair", label: "Ремонт" },
    { id: "beauty", label: "Красота" },
    { id: "education", label: "Обучение" },
    { id: "cleaning", label: "Клининг" },
    { id: "delivery", label: "Доставка" },
    { id: "car-service", label: "Автосервис" },
    { id: "photo-video-services", label: "Фото и видео" },
    { id: "it", label: "IT-услуги" }
  ],
  parts: [
    { id: "car-parts", label: "Автозапчасти" },
    { id: "tires-wheels", label: "Шины и диски" },
    { id: "oils-fluids", label: "Масла и жидкости" },
    { id: "car-accessories", label: "Аксессуары" },
    { id: "moto-parts", label: "Мото-запчасти" },
    { id: "tools", label: "Инструменты" }
  ],
  home: [
    { id: "furniture", label: "Мебель" },
    { id: "appliances", label: "Бытовая техника" },
    { id: "dishes", label: "Посуда" },
    { id: "textile", label: "Текстиль" },
    { id: "renovation", label: "Ремонт и стройка" },
    { id: "garden", label: "Сад и растения" },
    { id: "decor", label: "Декор" }
  ],
  business: [
    { id: "equipment", label: "Оборудование" },
    { id: "ready-business", label: "Готовый бизнес" },
    { id: "commerce", label: "Торговля" },
    { id: "office", label: "Офис" },
    { id: "warehouse", label: "Склад" },
    { id: "materials", label: "Сырьё" },
    { id: "franchise", label: "Франшизы" }
  ]
};

export function getSubcategories(category: string) {
  return sellSubcategoriesByCategory[category] ?? [];
}

export function getSubcategoryLabel(category: string, value?: string) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return "";
  }

  return (
    getSubcategories(category).find(
      (subcategory) =>
        subcategory.id === normalizedValue || subcategory.label === normalizedValue
    )?.label ?? normalizedValue
  );
}

export const tashkentDistricts = [
  { id: "yunusabad", label: "Юнусабад" },
  { id: "chilanzar", label: "Чиланзар" },
  { id: "mirabad", label: "Мирабад" },
  { id: "shaykhantakhur", label: "Шайхантахур" },
  { id: "yakkasaray", label: "Яккасарай" },
  { id: "almazar", label: "Алмазар" },
  { id: "sergeli", label: "Сергели" },
  { id: "uchtepa", label: "Учтепа" },
  { id: "yashnabad", label: "Яшнабад" },
  { id: "bektemir", label: "Бектемир" }
];
