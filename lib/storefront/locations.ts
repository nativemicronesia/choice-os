// Choice has two physical locations in Chuuk. Every operational detail is null
// until Choice supplies it; the Visit page renders clear "to be confirmed"
// placeholders rather than invented addresses, phones or hours.

export type Location = {
  id: "dine-in" | "stop-by";
  name: string;
  kind: string;
  summary: string;
  slot: string;
  address: string | null;
  directions: string | null;
  phone: string | null;
  hours: string | null;
};

export const LOCATIONS: Location[] = [
  {
    id: "dine-in",
    name: "The Restaurant",
    kind: "Dine-in",
    summary: "Sit down, settle in and enjoy your meal at the table.",
    slot: "location-dine-in",
    address: null,
    directions: null,
    phone: null,
    hours: null,
  },
  {
    id: "stop-by",
    name: "The Stop-by Shop",
    kind: "Stop-by",
    summary: "Quick in, quick out. Grab your food and keep moving.",
    slot: "location-stop-by",
    address: null,
    directions: null,
    phone: null,
    hours: null,
  },
];
