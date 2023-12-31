export const getBaseUrl = () => {
  let url;
  switch (process.env.NODE_ENV) {
    case 'production':
      url = 'https://api.justreadcomics.com';
      break;
    case 'test':
      url = 'http://localhost:8080';
      break;
    case 'development':
    default:
      url = 'http://localhost:8090';
  }

  return url;
};
