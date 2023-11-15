export const cleanFileName = (s: string) => {
  return s
    .trim()
    .replace(/[^a-z0-9.]/gi, '_')
    .toLowerCase();
};

export const cleanSeriesName = (s: string) => {
  return s.replace(/[^a-z0-9()\-_ .&#]/gi, '').trim();
};
