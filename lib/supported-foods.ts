export const SUPPORTED_MODEL_FOODS = [
  "abacha",
  "afang_soup",
  "akara",
  "amala",
  "asaro",
  "banga_soup",
  "beans",
  "boli",
  "chin_chin",
  "edikaikong_soup",
  "egusi_soup",
  "ewedu_soup",
  "jollof_rice_nigeria",
  "masa",
  "meat_pie",
  "moi_moi",
  "nkwobi",
  "ogbono_soup",
  "oha_soup",
  "okro_soup",
  "pepper_soup",
  "plantain",
  "puff_puff",
  "rice_and_stew",
  "suya",
  "vegetable_soup",
  "yam",
] as const

export function formatFoodLabel(slug: string) {
  return slug
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}
