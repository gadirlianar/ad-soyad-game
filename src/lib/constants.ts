import { Category, RoomSettings } from '@/types/game';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'ad', label: 'First Name', azLabel: 'Ad', iconName: 'User' },
  { id: 'soyad', label: 'Last Name', azLabel: 'Soyad', iconName: 'Users' },
  { id: 'seher', label: 'City', azLabel: 'Şəhər', iconName: 'Building2' },
  { id: 'olke', label: 'Country', azLabel: 'Ölkə', iconName: 'Globe' },
  { id: 'heyvan', label: 'Animal', azLabel: 'Heyvan', iconName: 'Footprints' },
  { id: 'meyve_bitki', label: 'Fruit / Plant', azLabel: 'Meyvə / Bitki', iconName: 'Apple' },
  { id: 'esya', label: 'Object / Item', azLabel: 'Əşya', iconName: 'Package' },
];

export const SUGGESTED_CUSTOM_CATEGORIES: Category[] = [
  { id: 'pese', label: 'Profession', azLabel: 'Peşə / İxtisas', iconName: 'Briefcase', isCustom: true },
  { id: 'film', label: 'Movie / Series', azLabel: 'Kino / Serial', iconName: 'Film', isCustom: true },
  { id: 'brend', label: 'Brand / Company', azLabel: 'Brend / Şirkət', iconName: 'Tag', isCustom: true },
  { id: 'idman', label: 'Sport / Athlete', azLabel: 'İdman / İdmançı', iconName: 'Trophy', isCustom: true },
  { id: 'yemek', label: 'Food / Dish', azLabel: 'Yemək / Şirniyyat', iconName: 'Utensils', isCustom: true },
  { id: 'mahnı', label: 'Song / Singer', azLabel: 'Mahnı / Müğənni', iconName: 'Music', isCustom: true },
];

// Azerbaijani alphabet suitable for word start (excluding Ğ, I which don't start words in standard Azerbaijani)
export const AZERBAIJANI_ALPHABET = [
  'A', 'B', 'C', 'Ç', 'D', 'E', 'Ə', 'F', 'G', 'H', 'X', 'İ',
  'J', 'K', 'Q', 'L', 'M', 'N', 'O', 'Ö', 'P', 'R', 'S', 'Ş',
  'T', 'U', 'Ü', 'V', 'Y', 'Z'
];

export const ENGLISH_ALPHABET = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
  'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
  'Y', 'Z'
];

export const PLAYER_AVATARS = [
  '🦁', '🦅', '🐺', '🦊', '🚀', '⚡', '👑', '🎯',
  '🔥', '💎', '🦄', '🐼', '🐉', '🍀', '🌟', '🎨'
];

export const DEFAULT_SETTINGS: RoomSettings = {
  roundDuration: 60, // 60 seconds default
  totalRounds: 5,
  categories: DEFAULT_CATEGORIES,
  alphabet: AZERBAIJANI_ALPHABET,
  gracePeriodSeconds: 5,
};

export const DURATION_OPTIONS = [
  { value: 30, label: '30 saniyə' },
  { value: 45, label: '45 saniyə' },
  { value: 60, label: '60 saniyə' },
  { value: 90, label: '90 saniyə' },
  { value: 120, label: '120 saniyə' },
  { value: 0, label: 'Limitsiz (Yalnız STOP)' },
];

export const ROUND_OPTIONS = [3, 5, 7, 10];
