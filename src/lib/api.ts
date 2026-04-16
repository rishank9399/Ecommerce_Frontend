import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(`${API_BASE_URL}/user/refresh-token`, {}, { withCredentials: true });
        if (data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data: { username: string; email: string; password: string; role?: string }) =>
    api.post("/user/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/user/login", data),
  logout: () => api.post("/user/logout"),
  getProfile: () => api.get("/user/profile"),
  updateProfile: (data: any) => api.patch("/user/update-profile", data),
  refreshToken: () => api.post("/user/refresh-token"),
};

// Products
export const productAPI = {
  getAll: (params?: Record<string, string>) => api.get("/product", { params }),
  getById: (id: string) => api.get(`/product/${id}`),
  create: (formData: FormData) => api.post("/product", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id: string, formData: FormData) => api.patch(`/product/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  delete: (id: string) => api.delete(`/product/${id}`),
};

// Categories
export const categoryAPI = {
  getAll: () => api.get("/category"),
  getById: (id: string) => api.get(`/category/${id}`),
  create: (data: { name: string }) => api.post("/category", data),
  update: (id: string, data: { name: string }) => api.patch(`/category/${id}`, data),
  delete: (id: string) => api.delete(`/category/${id}`),
};

// Cart
export const cartAPI = {
  get: () => api.get("/cart"),
  add: (data: { productId: string; quantity: number; priceAtPurchase: number }) =>
    api.post("/cart", data),
  updateItem: (productId: string) => api.patch(`/cart/${productId}`),
  removeItem: (productId: string) => api.delete(`/cart/${productId}`),
  clear: () => api.delete("/cart"),
};

// Orders
export const orderAPI = {
  create: (razorpayOrderId: string, razorpayPaymentId: string, signature: string, addressData: any) =>
    api.post(`/order/${razorpayOrderId}/${razorpayPaymentId}/${signature}`, addressData),
  getMyOrders: () => api.get("/order"),
  getById: (id: string) => api.get(`/order/${id}`),
  updateStatus: (id: string, status: string) => api.patch(`/order/${id}/status`, { status }),
};

// Payment
export const paymentAPI = {
  createOrder: () => api.post("/payment/create/order"),
  verify: (data: { razorpayOrderId: string; razorpayPaymentId: string; signature: string }) =>
    api.post("/payment/verify", data),
};

// Reviews
export const reviewAPI = {
  getByProduct: (productId: string) => api.get(`/review/${productId}`),
  add: (productId: string, data: { rating: number; comment?: string }) =>
    api.post(`/review/${productId}`, data),
  delete: (reviewId: string) => api.delete(`/review/${reviewId}`),
};

// Delivery
export const deliveryAPI = {
  track: (orderId: string) => api.get(`/delivery/${orderId}`),
  assign: (orderId: string) => api.post(`/delivery/${orderId}`),
  updateStatus: (deliveryId: string, status: string) =>
    api.patch(`/delivery/${deliveryId}/status`, { status }),
};

export default api;
