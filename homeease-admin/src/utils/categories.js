// Temporary: these pairs mirror the Booking Service seed data. Replace with a
// fetch of the Booking Service's /api/services endpoint once it exposes
// categories, so this list stops drifting from the database.
export const CATEGORIES = [
  { id: 1, name: "Electrician" },
  { id: 2, name: "Plumbing" },
  { id: 3, name: "Home Cleaning" },
  { id: 4, name: "AC Service" },
];

export function categoryName(categoryId) {
  return (
    CATEGORIES.find(
      (category) => category.id === categoryId
    )?.name ?? categoryId
  );
}
