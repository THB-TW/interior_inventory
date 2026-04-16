import axios, { type AxiosResponse } from 'axios';
import type { ApiResponse } from '@/types/project';

// Axios 實例：統一設定 baseURL 與 headers
const apiClient = axios.create({
  baseURL: '/api',   // Vite proxy 會將此轉發到 localhost:8080/api
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response 攔截器：把後端 ApiResponse<T> 的 data 層解包出來
// 成功時 resolve data 欄位；失敗時把 message 欄位當作錯誤訊息 throw 出去
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    const apiRes = response.data;
    if (apiRes.success) {
      // 把真正的資料（data 欄位）往後傳，讓呼叫端直接拿到資料
      return { ...response, data: apiRes.data };
    }
    // 後端回傳 success: false 時，當作錯誤處理
    return Promise.reject(new Error(apiRes.message || '操作失敗'));
  },
  (error) => {
    // HTTP 層錯誤處理（4xx / 5xx）
    const message =
      error.response?.data?.message ||
      error.message ||
      '網路連線異常，請稍後再試';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
