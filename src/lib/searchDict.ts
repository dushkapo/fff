// Multilingual search dictionary for flowers and bouquets
// Maps English and Georgian terms to Russian equivalents

const SEARCH_TRANSLATIONS: Record<string, string[]> = {
    // English -> Russian search terms
    'rose': ['роза', 'розы', 'розовый'],
    'roses': ['роза', 'розы', 'розовый'],
    'tulip': ['тюльпан', 'тюльпаны'],
    'tulips': ['тюльпан', 'тюльпаны'],
    'peony': ['пион', 'пионы'],
    'peonies': ['пион', 'пионы'],
    'lily': ['лилия', 'лилии'],
    'lilies': ['лилия', 'лилии'],
    'chrysanthemum': ['хризантема', 'хризантемы'],
    'chrysanthemums': ['хризантема', 'хризантемы'],
    'daisy': ['ромашка', 'ромашки'],
    'daisies': ['ромашка', 'ромашки'],
    'sunflower': ['подсолнух', 'подсолнухи'],
    'sunflowers': ['подсолнух', 'подсолнухи'],
    'orchid': ['орхидея', 'орхидеи'],
    'orchids': ['орхидея', 'орхидеи'],
    'hydrangea': ['гортензия', 'гортензии'],
    'hydrangeas': ['гортензия', 'гортензии'],
    'carnation': ['гвоздика', 'гвоздики'],
    'carnations': ['гвоздика', 'гвоздики'],
    'lavender': ['лаванда'],
    'iris': ['ирис', 'ирисы'],
    'irises': ['ирис', 'ирисы'],
    'gerbera': ['гербера', 'герберы'],
    'gerberas': ['гербера', 'герберы'],
    'ranunculus': ['ранункулюс', 'лютик'],
    'freesia': ['фрезия', 'фрезии'],
    'alstroemeria': ['альстромерия'],
    'gypsophila': ['гипсофила'],
    'baby breath': ['гипсофила'],
    'eustoma': ['эустома', 'лизиантус'],
    'lisianthus': ['эустома', 'лизиантус'],
    'bouquet': ['букет', 'букеты'],
    'bouquets': ['букет', 'букеты'],
    'flower': ['цветок', 'цветы', 'цвет'],
    'flowers': ['цветок', 'цветы', 'цвет'],
    'white': ['белый', 'белая', 'белые', 'белых'],
    'red': ['красный', 'красная', 'красные', 'красных'],
    'pink': ['розовый', 'розовая', 'розовые', 'розовых'],
    'yellow': ['жёлтый', 'желтый', 'жёлтая', 'желтая', 'жёлтые', 'желтые'],
    'blue': ['синий', 'синяя', 'синие', 'голубой', 'голубая', 'голубые'],
    'purple': ['фиолетовый', 'фиолетовая', 'сиреневый', 'лиловый'],
    'orange': ['оранжевый', 'оранжевая', 'оранжевые'],
    'green': ['зелёный', 'зеленый', 'зелёная', 'зеленая'],
    'mixed': ['микс', 'смешанный', 'ассорти'],
    'spring': ['весенний', 'весна', 'весенние'],
    'summer': ['летний', 'лето', 'летние'],
    'autumn': ['осенний', 'осень', 'осенние'],
    'winter': ['зимний', 'зима', 'зимние'],
    'wedding': ['свадебный', 'свадьба', 'свадебные'],
    'birthday': ['день рождения', 'именинный'],
    'love': ['любовь', 'любовный'],
    'romantic': ['романтический', 'романтичный', 'романтика'],
    'elegant': ['элегантный', 'элегантная', 'изысканный'],
    'luxury': ['люкс', 'премиум', 'роскошный'],
    'premium': ['премиум', 'премиальный'],
    'small': ['маленький', 'маленькая', 'мини', 'небольшой'],
    'big': ['большой', 'большая', 'огромный'],
    'large': ['большой', 'большая', 'огромный'],
    'delicate': ['нежный', 'нежная', 'нежные'],
    'bright': ['яркий', 'яркая', 'яркие'],

    // Georgian -> Russian search terms
    'ვარდი': ['роза', 'розы'],
    'ტიტა': ['тюльпан', 'тюльпаны'],
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
    'თაიგული': ['букет', 'букеты'],
    'ყვავილი': ['цветок', 'цветы'],
    'ყვავილები': ['цветок', 'цветы'],
    'თეთრი': ['белый', 'белая', 'белые'],
    'წითელი': ['красный', 'красная', 'красные'],
    'ვარდისფერი': ['розовый', 'розовая', 'розовые'],
    'ყვითელი': ['жёлтый', 'желтый', 'жёлтая'],
    'ლურჯი': ['синий', 'синяя', 'голубой'],
    'იისფერი': ['фиолетовый', 'сиреневый'],
    'ნარინჯისფერი': ['оранжевый', 'оранжевые'],
    'მწვანე': ['зелёный', 'зеленый'],
};

/**
 * Expands a search query with translations from English/Georgian to Russian.
 * Returns an array of search terms to match against.
 */
export function getSearchTerms(query: string): string[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const terms = [q];

    // Check each word in the query against the dictionary
    const words = q.split(/\s+/);
    for (const word of words) {
        const translations = SEARCH_TRANSLATIONS[word];
        if (translations) {
            terms.push(...translations);
        }
    }

    // Also check the full query as a phrase
    const fullTranslations = SEARCH_TRANSLATIONS[q];
    if (fullTranslations) {
        terms.push(...fullTranslations);
    }

    return Array.from(new Set(terms)); // Remove duplicates
}

/**
 * Check if an item matches the search query (multilingual).
 * Searches name and description fields.
 */
export function matchesSearch(name: string, description: string | undefined | null, query: string): boolean {
    if (!query.trim()) return true;

    const terms = getSearchTerms(query);
    const nameL = name.toLowerCase();
    const descL = (description || '').toLowerCase();

    return terms.some(term => nameL.includes(term) || descL.includes(term));
}
