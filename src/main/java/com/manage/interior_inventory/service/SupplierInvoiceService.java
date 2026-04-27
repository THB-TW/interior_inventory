package com.manage.interior_inventory.service;

import com.manage.interior_inventory.dto.finance.invoice.SupplierInvoiceUploadResponse;
import com.manage.interior_inventory.dto.finance.invoice.UpdateInvoiceAmountRequest;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface SupplierInvoiceService {

    /** 上傳 PDF → 解析 → 比對 → 寫入 DB → 回傳比對結果 */
    SupplierInvoiceUploadResponse uploadAndParse(Long projectId, MultipartFile file);

    /** 查詢單一對帳單的完整明細（含批次分組） */
    SupplierInvoiceUploadResponse getDetail(Long invoiceId);

    /** 查詢某案件的所有對帳單摘要列表 */
    List<SupplierInvoiceUploadResponse> listByProject(Long projectId);

    SupplierInvoiceUploadResponse updateAmounts(Long invoiceId, UpdateInvoiceAmountRequest req);
}