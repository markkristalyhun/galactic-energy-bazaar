import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/planets', () => HttpResponse.json([
    {id: '1', name: 'Earth'},
    {id: '2', name: 'Ulthar'},
  ]))
];
