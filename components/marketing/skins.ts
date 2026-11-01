/** The marketing site's light skin. Dark mode is always Glow. Change this one value to switch; styles live in skins.css. */
export const LIGHT_SKINS = ["mint", "aurora", "peach"] as const;
export type LightSkin = (typeof LIGHT_SKINS)[number];
export const LIGHT_SKIN: LightSkin = "mint";
