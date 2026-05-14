import client from './client';

export const assessmentApi = {
  list:    ()        => client.get('/assessments'),
  latest:  ()        => client.get('/assessments/latest'),
  getOne:  (id)      => client.get(`/assessments/${id}`),
  create:  (data)    => client.post('/assessments', data),
  update:  (id,data) => client.put(`/assessments/${id}`, data),
  upload:  (id,data) => client.put(`/assessments/${id}/upload`, data),
  uploadCategory: (id, category, rows) => client.put(`/assessments/${id}/upload`, { category, rows }),
  saveGovernance: (id, flags) => client.put(`/assessments/${id}/governance`, { flags }),
  remove:  (id)      => client.delete(`/assessments/${id}`),
  saveScores: (id, payload) =>
    client.put(`/assessments/${id}/scores`, payload),
  saveResults: (id, results) =>
    client.put(`/assessments/${id}/results`, results),
  generatePdf: (id) =>
    client.post(`/assessments/${id}/pdf`),
};

export default assessmentApi;