import axios from "axios";

const api = axios.create({
    baseURL: "https://172.23.208.1:500",  // Substitua pelo IP do backend
});

export default api;
