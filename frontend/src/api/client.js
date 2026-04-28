import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:5000', // adjust if your backend is hosted elsewhere
});

export default client;
