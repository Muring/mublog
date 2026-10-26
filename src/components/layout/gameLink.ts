// Configure the public URL before building the blog. Unconfigured production
// deployments must never send readers to localhost or an unclaimed domain.
const configuredUrl = process.env.NEXT_PUBLIC_DICE_DUNGEON_URL?.trim();

export const diceDungeonUrl = configuredUrl ||
    (process.env.NODE_ENV === "development" ? "http://localhost:4173" : null);
