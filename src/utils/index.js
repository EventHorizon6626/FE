export const IDshorten = (id) => {
  if (!id || typeof id !== 'string') return '';
  return id.length > 8 ? `${id.slice(0, 4)}...${id.slice(-4)}` : id;
};