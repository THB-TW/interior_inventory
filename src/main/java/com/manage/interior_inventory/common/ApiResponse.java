package com.manage.interior_inventory.common;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "API 統一回應格式")
public class ApiResponse<T> {

    @Schema(description = "執行結果是否成功", example = "true")
    private boolean success;

    @Schema(description = "系統訊息或錯誤提示", example = "操作成功")
    private String message;

    @Schema(description = "回傳資料主體")
    private T data;

    /**
     * 成功回應，不帶資料
     */
    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>(true, message, null);
    }

    /**
     * 成功回應，帶資料
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    /**
     * 失敗/錯誤回應
     */
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }
}
