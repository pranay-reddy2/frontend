import client from './client';

export const authAPI = {
  register: async (data) => {
    const response = await client.post('/auth/register', data);
    return response.data;
  },

  login: async (data) => {
    const response = await client.post('/auth/login', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await client.get('/auth/profile');
    return response.data;
  },
};
