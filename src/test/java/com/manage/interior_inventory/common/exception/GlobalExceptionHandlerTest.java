package com.manage.interior_inventory.common.exception;

import com.manage.interior_inventory.common.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class GlobalExceptionHandlerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new TestController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void handleIllegalArgumentException_ShouldReturn400() throws Exception {
        mockMvc.perform(get("/test/illegal-argument"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid argument"));
    }

    @Test
    void handleIllegalStateException_ShouldReturn409() throws Exception {
        mockMvc.perform(get("/test/illegal-state"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid state"));
    }

    @Test
    void handleHttpMessageNotReadable_ShouldReturn400() throws Exception {
        mockMvc.perform(get("/test/http-message-not-readable"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(containsString("資料格式錯誤")));
    }

    @Test
    void handleDataIntegrityViolation_ShouldReturn400() throws Exception {
        mockMvc.perform(get("/test/data-integrity"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(containsString("資料儲存失敗")));
    }

    @Test
    void handleAllExceptions_ShouldReturn500() throws Exception {
        mockMvc.perform(get("/test/generic-exception"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(containsString("系統發生異常")));
    }

    @Test
    void handleValidationException_ShouldReturn400() throws Exception {
        mockMvc.perform(get("/test/validation"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(containsString("資料驗證失敗")))
                .andExpect(jsonPath("$.message").value(containsString("field: error message")));
    }

    @RestController
    static class TestController {

        @GetMapping("/test/illegal-argument")
        public void throwIllegalArgument() {
            throw new IllegalArgumentException("Invalid argument");
        }

        @GetMapping("/test/illegal-state")
        public void throwIllegalState() {
            throw new IllegalStateException("Invalid state");
        }

        @GetMapping("/test/http-message-not-readable")
        public void throwHttpMessageNotReadable() {
            throw new HttpMessageNotReadableException("JSON parse error", (org.springframework.http.HttpInputMessage) null);
        }

        @GetMapping("/test/data-integrity")
        public void throwDataIntegrity() {
            throw new DataIntegrityViolationException("Database error");
        }

        @GetMapping("/test/generic-exception")
        public void throwGenericException() throws Exception {
            throw new Exception("Unexpected error");
        }

        @GetMapping("/test/validation")
        public void throwValidation() throws MethodArgumentNotValidException, NoSuchMethodException {
            BindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "object");
            bindingResult.addError(new FieldError("object", "field", "error message"));
            org.springframework.core.MethodParameter methodParameter = new org.springframework.core.MethodParameter(
                this.getClass().getMethod("throwValidation"), -1);
            throw new MethodArgumentNotValidException(methodParameter, bindingResult);
        }
    }
}
