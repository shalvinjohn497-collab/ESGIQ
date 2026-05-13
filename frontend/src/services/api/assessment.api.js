
import client from './client';

export const assessmentApi = {
  list:    ()        => client.get('/assessments'),
  latest:  ()        => client.get('/assessments/latest'),
  getOne:  (id)      => client.get(`/assessments/${id}`),
  create:  (data)    => client.post('/assessments', data),
  update:  (id,data) => client.put(`/assessments/${id}`, data),
  remove:  (id)      => client.delete(`/assessments/${id}`),
};

export default assessmentApi;