export const cleanFileName = (s: string) => {
  return s
    .trim()
    .replace(/[^a-z0-9.]/gi, '_')
    .toLowerCase();
};

export const cleanSeriesName = (s: string) => {
  return s.replace(/[^a-z0-9()\-_ .&#'"]/gi, '').trim();
};

export const extractContentsOfParenthesis = (s: string) => {
  const withinParenthesis = /\(([^)]+)\)/gi;
  if (s) {
    const contentExec = s.match(withinParenthesis);
    if (contentExec?.length) {
      return contentExec[1];
    }
  }
  return '';
};
