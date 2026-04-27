package com.manage.interior_inventory.common.exception;

import com.manage.interior_inventory.common.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 全域例外處理器
 * 攔截 Controller 層拋出的例外，並統一封裝成 ApiResponse 格式回傳給前端。
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 處理 @Valid 驗證失敗的例外 (例如：前端漏傳必填欄位或格式不對)
     * HTTP Status: 400 Bad Request
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Object> handleValidationException(MethodArgumentNotValidException ex) {
        BindingResult bindingResult = ex.getBindingResult();
        List<FieldError> fieldErrors = bindingResult.getFieldErrors();

        String errorMessage = fieldErrors.stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        log.warn("請求參數驗證失敗: {}", errorMessage);
        return ApiResponse.error("資料驗證失敗: " + errorMessage);
    }

    /**
     * 處理 JSON 格式錯誤 (例如：欄位型別傳錯，salesUserId 應為 Long 卻傳了字串)
     * HTTP Status: 400 Bad Request
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Object> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        log.warn("JSON 格式轉換錯誤: {}", ex.getMessage());
        return ApiResponse.error("資料格式錯誤，請確認 JSON 欄位型別是否正確（例如：salesUserId 需為數字）。");
    }

    /**
     * 處理 IllegalArgumentException (在 Service 層常拋出，例如：查無案件 ID)
     * HTTP Status: 400 Bad Request
     */
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Object> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.warn("業務邏輯參數錯誤: {}", ex.getMessage());
        return ApiResponse.error(ex.getMessage());
    }

    /**
     * 處理 IllegalStateException (在 Service 層常拋出，例如：狀態不允許變更)
     * HTTP Status: 409 Conflict
     */
    @ExceptionHandler(IllegalStateException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ApiResponse<Object> handleIllegalStateException(IllegalStateException ex) {
        log.warn("業務狀態衝突錯誤: {}", ex.getMessage());
        return ApiResponse.error(ex.getMessage());
    }

    /**
     * 處理資料庫完整性錯誤 (例如 FK 不存在、Unique 重複)
     * HTTP Status: 400 Bad Request
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Object> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.warn("資料庫完整性約束錯誤: {}", ex.getMessage());
        return ApiResponse.error("資料儲存失敗，請確認傳入的 ID 是否存在，或資料是否重複。");
    }

    /**
     * 處理自定義業務邏輯例外
     * HTTP Status: 400 Bad Request
     */
    @ExceptionHandler(BusinessException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Object> handleBusinessException(BusinessException ex) {
        log.warn("業務邏輯錯誤: {}", ex.getMessage());
        return ApiResponse.error(ex.getMessage());
    }

    /**
     * 預設處理器：處理所有未被特化的例外，防止敏感系統錯誤直接噴給前端
     * HTTP Status: 500 Internal Server Error
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Object> handleAllExceptions(Exception ex) {
        log.error("系統發生未預期的例外狀況", ex);
        return ApiResponse.error("系統發生異常，請稍後再試或是聯絡系統管理員。");
    }
}
