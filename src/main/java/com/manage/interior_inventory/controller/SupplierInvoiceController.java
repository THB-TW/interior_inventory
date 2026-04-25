package com.manage.interior_inventory.controller;

import com.manage.interior_inventory.common.ApiResponse;
import com.manage.interior_inventory.dto.finance.invoice.InvoiceCompareResultDto;
import com.manage.interior_inventory.dto.finance.invoice.InvoiceConfirmRequest;
import com.manage.interior_inventory.dto.finance.invoice.SupplierInvoiceSummaryDto;
import com.manage.interior_inventory.service.SupplierInvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    @Operation(summary = "上傳並解析對帳單 PDF")
    public ApiResponse<InvoiceCompareResultDto> uploadInvoice(
            @RequestParam("projectId") Long projectId,
            @RequestParam("file") MultipartFile file) {
        return ApiResponse.success("解析成功", invoiceService.uploadAndParse(projectId, file));
    }

    @PostMapping("/confirm")
    @Operation(summary = "確認對帳單並寫入")
    public ApiResponse<Void> confirmInvoice(@Valid @RequestBody InvoiceConfirmRequest req) {
        invoiceService.confirmInvoice(req);
        return ApiResponse.success("對帳單已確認");
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "列出案件的歷史對帳單")
    public ApiResponse<List<SupplierInvoiceSummaryDto>> listByProject(@PathVariable Long projectId) {
        return ApiResponse.success("查詢成功", invoiceService.listByProject(projectId));
    }
}
