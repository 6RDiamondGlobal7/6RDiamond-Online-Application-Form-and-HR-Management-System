const tunnelPattern = /^([a-z0-9-]+)-\d+(\..*devtunnels\.ms)$/i;

export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    const match = hostname.match(tunnelPattern);
    if (match) {
      return `${protocol}//${match[1]}-5000${match[2]}`;
    }
  }

  return 'http://127.0.0.1:5000';
};
