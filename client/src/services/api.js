import axios from "axios";

export const createJob = (data) => api.post("/jobs", data);
export const getAllJobs = () => api.get("/jobs");

const api = axios.create({
  baseURL: "http://localhost:5001/api",
  headers: { "Content-Type": "application/json" },
});


export function setAuth(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
}

export function logout() {
  setAuth(null);
}

const savedToken = localStorage.getItem("token");
if (savedToken) {
  setAuth(savedToken);
}

export default api;

// import axios from "axios";

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || "https://careerkarma-kiae.onrender.com/api",
//   headers: { "Content-Type": "application/json" },
//   withCredentials: true,
// });

// export const registerUser = (data) => api.post("/auth/register", data);
// export const verifyUser = (data) => api.post("/auth/verify", data);
// export const loginUser = (data) => api.post("/auth/login", data);

// export function setAuth(token) {
//   if (token) {
//     api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//     localStorage.setItem("token", token);
//   } else {
//     delete api.defaults.headers.common["Authorization"];
//     localStorage.removeItem("token");
//   }
// }
// const savedToken = localStorage.getItem("token");
// if (savedToken) setAuth(savedToken);
// export default api;
