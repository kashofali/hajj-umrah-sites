// Default copy used when a client config doesn't provide its own.
// Keep it generic: nothing here should claim facts about a specific agency.
import type { Client, Faq, Item } from './types';

export function defaultServices(client: Pick<Client, 'city'>): Item[] {
  return [
    { icon: 'mosque', title: 'Umrah Packages', text: 'Group and family Umrah with flights, hotels near the Haram, meals and guided Ziyarat.' },
    { icon: 'moon', title: 'Hajj', text: 'Guidance and complete arrangements for Hajj, from registration to your return home.' },
    { icon: 'passport', title: 'Visa Services', text: 'Umrah, visit and tourist visas processed quickly, with every document checked for you.' },
    { icon: 'plane', title: 'Flight Tickets', text: `Domestic and international tickets at competitive fares, booked from ${client.city}.` },
  ];
}

export const DEFAULT_HIGHLIGHTS: Item[] = [
  { icon: 'utensils', title: 'Fresh Indian meals, three times a day' },
  { icon: 'bus', title: 'AC coaches for every transfer' },
  { icon: 'mosque', title: 'Ziyarat in Makkah and Madinah' },
  { icon: 'hotel', title: 'Hotels within walking distance of the Haram' },
  { icon: 'passport', title: 'Visa and paperwork handled for you' },
  { icon: 'users', title: 'Group leader with you throughout' },
];

export const DEFAULT_STEPS: Item[] = [
  { title: 'Choose a package', text: 'Browse our packages or tell us your dates, budget and family size.' },
  { title: 'Share documents', text: 'Send your passport and photo. We take care of the visa and bookings.' },
  { title: 'Learn the rituals', text: 'Join our pre-departure session to perform your Umrah with confidence.' },
  { title: 'Travel with peace', text: 'Our group leader looks after you from departure until you return home.' },
];

export const DEFAULT_VALUES: Item[] = [
  { icon: 'shield', title: 'Amanah', text: 'Your money and your trust are an amanah. Clear prices, written receipts and no surprises in Makkah.' },
  { icon: 'heart', title: 'Khidmah', text: 'Serving the guests of Allah is an honour. We look after elders, women and first-time pilgrims with extra care.' },
  { icon: 'book', title: 'Ilm', text: 'Every pilgrim learns the rituals before leaving, so the Umrah or Hajj is performed correctly and with confidence.' },
];

export const DEFAULT_EXCLUSIONS = [
  'Passport issuance or renewal',
  'Personal shopping, laundry and phone calls',
  'Extra baggage charges',
  'Anything not listed under inclusions',
];

export function defaultFaqs(client: Pick<Client, 'city'>): Faq[] {
  return [
    {
      q: 'Which documents do I need for Umrah?',
      a: 'A passport valid for at least 6 months from the travel date, two recent passport-size photos with a white background, and a copy of your Aadhaar card. We take care of the visa, insurance and Nusuk registration.',
    },
    {
      q: `Do your groups travel from ${client.city}?`,
      a: `Yes. We arrange travel from ${client.city} to the nearest international airport and on to Jeddah or Madinah. Tell us where you are and we will suggest the easiest route.`,
    },
    {
      q: 'Can women travel for Umrah without a mahram?',
      a: 'Saudi rules currently allow women to perform Umrah without a mahram. Rules can change, so we confirm the latest requirements when you book. Many families still prefer to travel together, and we are happy to advise.',
    },
    {
      q: 'How far in advance should I book?',
      a: 'For regular Umrah, 3–4 weeks is usually enough. For Ramadan and the December holidays we recommend booking 2–3 months ahead, and Hajj registration opens many months earlier.',
    },
    {
      q: 'Do you help elderly pilgrims and people who need a wheelchair?',
      a: 'Yes. We can arrange wheelchair assistance at airports and in the Haram, ground-floor or lift-access rooms, and a slower group pace for elders.',
    },
    {
      q: 'What does "quad sharing" mean?',
      a: 'Prices are per person. Quad sharing means four people share one room, triple means three and double means two. Families can usually book a room together.',
    },
    {
      q: 'How do I pay?',
      a: 'A booking amount confirms your seat, and the balance is due before the visa is applied. We share the payment options when you book and give a receipt for every payment.',
    },
    {
      q: 'Can you plan a private Umrah for my family?',
      a: 'Yes. Tell us your dates, budget and hotel preferences on WhatsApp and we will plan a private itinerary for your family.',
    },
  ];
}
