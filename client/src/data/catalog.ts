/*
 * Architecture: domain data is separate from page rendering.
 * Replace these static records with API calls later without changing feature UI.
 */
export type Phrase = { id: number; hindi: string; santhali: string; sound: string };
export type Book = { id: number; title: string; meta: string; subject: string; size: string };

export const phrases: Phrase[] = [
  { id: 0, hindi: "आपका नाम क्या है?", santhali: "आम ओल नाम दो?", sound: "aam ol naam do?" },
  { id: 1, hindi: "आप कैसे हैं?", santhali: "आम नेयना?", sound: "aam neyna?" },
  { id: 2, hindi: "आज हम सीखेंगे।", santhali: "तिसिंग आड़ा सापिंग।", sound: "tising aada saaping." },
  { id: 3, hindi: "फिर मिलेंगे।", santhali: "दोसार दाड़ेयाना।", sound: "dosar dadeyana." },
  { id: 4, hindi: "धन्यवाद।", santhali: "जोहा।", sound: "joha." },
];

export const books: Book[] = [
  { id: 0, title: "गणित · कक्षा 1", meta: "Bilingual textbook", subject: "Mathematics", size: "14.8 MB" },
  { id: 1, title: "हिंदी · कक्षा 2", meta: "Bilingual textbook", subject: "Hindi", size: "18.2 MB" },
  { id: 2, title: "पर्यावरण अध्ययन", meta: "Teacher guide", subject: "EVS", size: "9.4 MB" },
  { id: 3, title: "कहानी संग्रह · कक्षा 1", meta: "Bilingual reader", subject: "Stories", size: "22.1 MB" },
];
