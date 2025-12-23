import axios from "axios";

const api = axios.create({
  baseURL: "http://10.194.215.138:5000/api",
});

export default api;
