export const IDshorten = (id, length = 8) => {
  if (!id || typeof id !== 'string') return '';
  return id.length > length ? `${id.slice(0, 4)}...${id.slice(-4)}` : id;
};