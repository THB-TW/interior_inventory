package com.manage.interior_inventory.controller;

import com.manage.interior_inventory.common.ApiResponse;
import com.manage.interior_inventory.dto.finance.invoice.SupplierInvoiceUploadResponse;
import com.manage.interior_inventory.service.SupplierInvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/finance/supplier-invoices")
@RequiredArgsConstructor
@Tag(name = "建材商對帳單")
public class SupplierInvoiceController {

    private final SupplierInvoiceService invoiceService;

    /**
     * 上傳 PDF → 解析 → 比對 → 存 DB → 回傳比對結果
     * POST /api/finance/supplier-invoices/upload
     * form-data: projectId (Long), file (PDF)
     */
    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    @Operation(summary = "上傳並解析建材商對帳單 PDF")
    public ApiResponse<SupplierInvoiceUploadResponse> uploadInvoice(
            @RequestParam("projectId") Long projectId,
            @RequestParam("file") MultipartFile file) {
        return ApiResponse.success("解析成功", invoiceService.uploadAndParse(projectId, file));
    }

    /**
     * 查詢單一對帳單完整明細（含批次分組）
     * GET /api/finance/supplier-invoices/{invoiceId}
     */
    @GetMapping("/{invoiceId}")
    @Operation(summary = "查詢單一對帳單明細")
    public ApiResponse<SupplierInvoiceUploadResponse> getDetail(
            @PathVariable Long invoiceId) {
        return ApiResponse.success("查詢成功", invoiceService.getDetail(invoiceId));
    }

    /**
     * 查詢案件的所有歷史對帳單列表
     * GET /api/finance/supplier-invoices/project/{projectId}
     */
    @GetMapping("/project/{projectId}")
    @Operation(summary = "列出案件的歷史對帳單")
    public ApiResponse<List<SupplierInvoiceUploadResponse>> listByProject(
            @PathVariable Long projectId) {
        return ApiResponse.success("查詢成功", invoiceService.listByProject(projectId));
    }
}