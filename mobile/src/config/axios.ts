import axios from "axios";

const api = axios.create({
  baseURL: "http://10.38.71.138:5000/api",
});

export default api;
