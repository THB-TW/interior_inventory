// ============================================================
// 後端 API 統一回應格式 ApiResponse<T> 的前端對應型別
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

// ============================================================
// 分頁相關型別
// ============================================================

export interface PageResponse<T> {
  content: T[];           // 當頁的資料陣列
  totalElements: number;  // 總資料筆數
  totalPages: number;     // 總頁數
  size: number;           // 每頁筆數
  number: number;         // 當前頁碼 (0-indexed)
  first: boolean;         // 是否為第一頁
  last: boolean;          // 是否為最後一頁
  empty: boolean;         // 當頁是否為空
}

export interface PageParams {
  page?: number;          // 頁碼 (0-indexed)
  size?: number;          // 每頁筆數
  sort?: string;          // 排序欄位，例如 "createdAt,desc"
}

// ============================================================
// 案件狀態 Enum（對應後端 ProjectStatus）
// ============================================================

export const ProjectStatus = {
  INQUIRY: 'INQUIRY',
  QUOTING: 'QUOTING',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  INSPECTION: 'INSPECTION',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED',
} as const;

export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

// 狀態中文顯示名稱對照表
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.INQUIRY]: '詢問中',
  [ProjectStatus.QUOTING]: '報價中',
  [ProjectStatus.CONFIRMED]: '已確認',
  [ProjectStatus.IN_PROGRESS]: '施工中',
  [ProjectStatus.INSPECTION]: '驗收中',
  [ProjectStatus.CLOSED]: '已結案',
  [ProjectStatus.CANCELLED]: '已取消',
};

// 狀態色系對照表 (對應 Tailwind CSS class)
export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  [ProjectStatus.INQUIRY]: 'bg-slate-100 text-slate-700',
  [ProjectStatus.QUOTING]: 'bg-amber-100 text-amber-700',
  [ProjectStatus.CONFIRMED]: 'bg-blue-100 text-blue-700',
  [ProjectStatus.IN_PROGRESS]: 'bg-indigo-100 text-indigo-700',
  [ProjectStatus.INSPECTION]: 'bg-purple-100 text-purple-700',
  [ProjectStatus.CLOSED]: 'bg-green-100 text-green-700',
  [ProjectStatus.CANCELLED]: 'bg-red-100 text-red-600',
};

// 合法的狀態流轉路徑（與後端狀態機保持一致）
export const PROJECT_STATUS_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  [ProjectStatus.INQUIRY]: [ProjectStatus.QUOTING],
  [ProjectStatus.QUOTING]: [ProjectStatus.CONFIRMED, ProjectStatus.INQUIRY],
  [ProjectStatus.CONFIRMED]: [ProjectStatus.IN_PROGRESS],
  [ProjectStatus.IN_PROGRESS]: [ProjectStatus.INSPECTION],
  [ProjectStatus.INSPECTION]: [ProjectStatus.CLOSED, ProjectStatus.IN_PROGRESS],
  [ProjectStatus.CLOSED]: [],
  [ProjectStatus.CANCELLED]: [],
};

// ============================================================
// 案件主要 Response 型別（對應後端 ProjectResponse）
// ============================================================

export interface Project {
  id: number;
  caseCode: string;
  clientName: string;
  clientPhone: string;
  city: string;
  district: string;
  addressLine: string;   // 對應後端 siteAddress
  status: ProjectStatus;
  salesUserId: number;
  estimatedDays?: number;
  createdAt: string;     // ISO 8601 datetime string
  updatedAt: string;
}

// ============================================================
// 案件列表查詢篩選參數型別
// ============================================================

export interface ProjectListParams extends PageParams {
  clientName?: string;
  city?: string;
  district?: string;
  status?: ProjectStatus | '';
}

// ============================================================
// 新增案件 Request 型別（對應後端 ProjectCreateRequest）
// ============================================================

export interface CreateProjectRequest {
  clientName: string;
  clientPhone?: string;
  city: string;
  district?: string;
  siteAddress: string;
  salesUserId: number;
  estimatedDays?: number;
}

// ============================================================
// 編輯案件 Request 型別（與新增共用，PUT 時不可改狀態）
// ============================================================

export type UpdateProjectRequest = CreateProjectRequest;

// ============================================================
// 狀態流轉 Request 型別
// ============================================================

export interface UpdateProjectStatusRequest {
  nextStatus: ProjectStatus;
}

// ============================================================
// API 錯誤格式
// ============================================================

export interface ApiError {
  success: false;
  message: string;
  data: null;
}
