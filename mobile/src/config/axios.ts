import axios from "axios";

const api = axios.create({
  baseURL: "http://172.17.55.138:5000/api",
});

export default api;
