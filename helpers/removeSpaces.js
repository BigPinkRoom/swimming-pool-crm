export function removeSpaces(relatives) {
  relatives.forEach((relative) => {
    relative.telephone = relative.telephone.replace(/\s+/g, "");
  });
  return relatives;
}
