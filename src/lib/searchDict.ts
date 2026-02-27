// Multilingual search dictionary for flowers and bouquets
// Maps English and Georgian terms to Russian equivalents
// Partial matching: typing "ros" will match "rose" -> "роза"

const DICT: Record<string, string[]> = {
    // === FLOWERS (English -> Russian) ===
    'rose': ['роза', 'розы', 'розовый', 'роз'],
    'roses': ['роза', 'розы', 'розовый', 'роз'],
    'tulip': ['тюльпан', 'тюльпаны', 'тюльпанов'],
    'tulips': ['тюльпан', 'тюльпаны', 'тюльпанов'],
    'peony': ['пион', 'пионы', 'пионов'],
    'peonies': ['пион', 'пионы', 'пионов'],
    'lily': ['лилия', 'лилии', 'лилий'],
    'lilies': ['лилия', 'лилии', 'лилий'],
    'chrysanthemum': ['хризантема', 'хризантемы'],
    'daisy': ['ромашка', 'ромашки'],
    'daisies': ['ромашка', 'ромашки'],
    'sunflower': ['подсолнух', 'подсолнухи'],
    'orchid': ['орхидея', 'орхидеи'],
    'orchids': ['орхидея', 'орхидеи'],
    'hydrangea': ['гортензия', 'гортензии'],
    'carnation': ['гвоздика', 'гвоздики'],
    'carnations': ['гвоздика', 'гвоздики'],
    'lavender': ['лаванда'],
    'iris': ['ирис', 'ирисы'],
    'gerbera': ['гербера', 'герберы'],
    'ranunculus': ['ранункулюс', 'лютик'],
    'freesia': ['фрезия', 'фрезии'],
    'eustoma': ['эустома', 'лизиантус'],
    'lisianthus': ['эустома', 'лизиантус'],
    'gypsophila': ['гипсофила'],
    'alstroemeria': ['альстромерия'],
    'bouquet': ['букет', 'букеты', 'букетов'],
    'bouquets': ['букет', 'букеты', 'букетов'],
    'flower': ['цветок', 'цветы', 'цвет', 'цветов'],
    'flowers': ['цветок', 'цветы', 'цвет', 'цветов'],

    // === COLORS (English -> Russian) ===
    'white': ['белый', 'белая', 'белые', 'белых', 'белое'],
    'red': ['красный', 'красная', 'красные', 'красных', 'красное'],
    'pink': ['розовый', 'розовая', 'розовые', 'розовых', 'розовое'],
    'yellow': ['жёлтый', 'желтый', 'жёлтая', 'желтая', 'жёлтые', 'желтые'],
    'blue': ['синий', 'синяя', 'синие', 'голубой', 'голубая', 'голубые'],
    'purple': ['фиолетовый', 'фиолетовая', 'сиреневый', 'лиловый'],
    'orange': ['оранжевый', 'оранжевая', 'оранжевые'],
    'green': ['зелёный', 'зеленый', 'зелёная', 'зеленая'],
    'mixed': ['микс', 'смешанный', 'ассорти'],

    // === DESCRIPTORS (English -> Russian) ===
    'spring': ['весенний', 'весна', 'весенние'],
    'summer': ['летний', 'лето', 'летние'],
    'autumn': ['осенний', 'осень', 'осенние'],
    'winter': ['зимний', 'зима', 'зимние'],
    'wedding': ['свадебный', 'свадьба', 'свадебные'],
    'birthday': ['день рождения', 'именинный'],
    'love': ['любовь', 'любовный'],
    'romantic': ['романтический', 'романтика'],
    'elegant': ['элегантный', 'изысканный'],
    'luxury': ['люкс', 'премиум', 'роскошный'],
    'premium': ['премиум', 'премиальный'],
    'small': ['маленький', 'мини', 'небольшой'],
    'big': ['большой', 'огромный'],
    'large': ['большой', 'огромный'],
    'delicate': ['нежный', 'нежная', 'нежные'],
    'bright': ['яркий', 'яркая', 'яркие'],
    'beautiful': ['красивый', 'красивая', 'красивые'],
    'fresh': ['свежий', 'свежая', 'свежие'],

    // === FLOWERS (Georgian -> Russian) ===
    'ვარდი': ['роза', 'розы', 'роз'],
    'ვარდები': ['роза', 'розы', 'роз'],
    'ტიტა': ['тюльпан', 'тюльпаны'],
    'ტიტები': ['тюльпан', 'тюльпаны'],
    'იასამანი': ['пион', 'пионы'],
    'შროშანი': ['лилия', 'лилии'],
    'ქრიზანთემა': ['хризантема', 'хризантемы'],
    'გვირილა': ['ромашка', 'ромашки'],
    'მზესუმზირა': ['подсолнух', 'подсолнухи'],
    'ორქიდეა': ['орхидея', 'орхидеи'],
    'ჰორტენზია': ['гортензия', 'гортензии'],
    'მიხაკი': ['гвоздика', 'гвоздики'],
    'ლავანდა': ['лаванда'],
    'ირისი': ['ирис', 'ирисы'],
    'გერბერა': ['гербера', 'герберы'],
    'ფრეზია': ['фрезия'],
    'ეუსტომა': ['эустома'],
    'თაიგული': ['букет', 'букеты'],
    'თაიგულები': ['букет', 'букеты'],
    'ყვავილი': ['цветок', 'цветы'],
    'ყვავილები': ['цветок', 'цветы'],

    // === COLORS (Georgian -> Russian) ===
    'თეთრი': ['белый', 'белая', 'белые'],
    'წითელი': ['красный', 'красная', 'красные'],
    'ვარდისფერი': ['розовый', 'розовая', 'розовые'],
    'ყვითელი': ['жёлтый', 'желтый', 'жёлтая'],
    'ლურჯი': ['синий', 'синяя', 'голубой'],
    'იისფერი': ['фиолетовый', 'сиреневый'],
    'ნარინჯისფერი': ['оранжевый', 'оранжевые'],
    'მწვანე': ['зелёный', 'зеленый'],
    'ლამაზი': ['красивый', 'красивая'],
    'ნაზი': ['нежный', 'нежная'],
    'კაშკაშა': ['яркий', 'яркая'],

    // === DESCRIPTORS (Georgian -> Russian) ===
    'გაზაფხული': ['весенний', 'весна'],
    'ზაფხული': ['летний', 'лето'],
    'შემოდგომა': ['осенний', 'осень'],
    'ზამთარი': ['зимний', 'зима'],
    'ქორწილი': ['свадебный', 'свадьба'],
    'სიყვარული': ['любовь'],
    'რომანტიკა': ['романтический', 'романтика'],
    'პრემიუმი': ['премиум'],
    'დიდი': ['большой', 'огромный'],
    'პატარა': ['маленький', 'мини'],
};

// Get all dictionary keys once
const DICT_KEYS = Object.keys(DICT);

/**
 * Get all search terms to match against, expanding via dictionary.
 * Supports partial input: typing "ros" matches "rose" key -> returns Russian translations.
 */
export function getSearchTerms(query: string): string[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const terms: string[] = [q];

    // Split query into words
    const words = q.split(/\s+/);

    for (let w = 0; w < words.length; w++) {
        const word = words[w];
        if (word.length < 2) continue; // Skip single chars to avoid too many matches

        for (let k = 0; k < DICT_KEYS.length; k++) {
            const key = DICT_KEYS[k];
            // Partial match: "ros" matches "rose", "roses"
            // Also: "rose" matches "ros" prefix typed by user
            if (key.indexOf(word) === 0 || word.indexOf(key) === 0) {
                const translations = DICT[key];
                for (let t = 0; t < translations.length; t++) {
                    terms.push(translations[t]);
                }
            }
        }
    }

    // Deduplicate
    const seen: Record<string, boolean> = {};
    const unique: string[] = [];
    for (let i = 0; i < terms.length; i++) {
        if (!seen[terms[i]]) {
            seen[terms[i]] = true;
            unique.push(terms[i]);
        }
    }
    return unique;
}

/**
 * Check if an item matches the search query (multilingual).
 * Searches name and description fields against all expanded terms.
 */
export function matchesSearch(
    name: string,
    description: string | undefined | null,
    query: string
): boolean {
    if (!query.trim()) return true;

    const terms = getSearchTerms(query);
    const nameL = name.toLowerCase();
    const descL = (description || '').toLowerCase();

    for (let i = 0; i < terms.length; i++) {
        if (nameL.indexOf(terms[i]) !== -1 || descL.indexOf(terms[i]) !== -1) {
            return true;
        }
    }
    return false;
}
