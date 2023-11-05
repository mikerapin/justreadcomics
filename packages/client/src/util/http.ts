export const getBaseUrl = () => {
  let url;
  switch (process.env.NODE_ENV) {
    case 'production':
      url = 'https://www.justreadcomics.com/';
      break;
    case 'development':
    default:
      url = 'http://localhost:8090';
  }

  return url;
};
