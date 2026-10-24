/**
 * Section 3.2 Era Tints (3D scenes only, never UI).
 * Each stage gets one flat tint for scene lighting and background,
 * so the world visibly changes as you scrub.
 */
export const ERA_STAGES = [
  {
    id: "01",
    name: "Hadean-Archean",
    range: "4,600 - 2,500 Ma",
    tint: "#B3261E",
    colorName: "molten red",
    mood: "Violent, unfinished",
    ambientSound: "Low rumble, lava crackle",
  },
  {
    id: "02",
    name: "Proterozoic",
    range: "2,500 - 541 Ma",
    tint: "#1F6F8B",
    colorName: "deep ocean",
    mood: "Quiet, slow, watery",
    ambientSound: "Underwater hum",
  },
  {
    id: "03",
    name: "Paleozoic",
    range: "541 - 252 Ma",
    tint: "#4C9A5B",
    colorName: "fern green",
    mood: "Crowded seas, first land",
    ambientSound: "Wet air, insects",
  },
  {
    id: "04",
    name: "Mesozoic",
    range: "252 - 66 Ma",
    tint: "#E0701A",
    colorName: "amber",
    mood: "Heat, giants, doom ahead",
    ambientSound: "Jungle bed, distant roars",
  },
  {
    id: "05",
    name: "Cenozoic",
    range: "66 - 0 Ma",
    tint: "#4F86F7",
    colorName: "open sky",
    mood: "Open, recent, human",
    ambientSound: "Wind, birds, sparse tones",
  },
];
