import client from './client';

export const consultationApi = {
  create: (data) => client.post('/consultations', data),
};

export default consultationApi;
