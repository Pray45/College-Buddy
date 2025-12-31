import axios from "axios";

const api = axios.create({
  baseURL: "http://10.27.4.138:5000/api",
});

export default api;
