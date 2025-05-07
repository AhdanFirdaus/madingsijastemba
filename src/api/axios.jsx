import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost/madingsijastemba/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
