import axios from "axios";

const api = axios.create({
  baseURL: "http://10.11.1.80:5000", // Substitua pelo IP do backend
});

export default api;
