package com.manage.interior_inventory.service;

import com.manage.interior_inventory.dto.finance.invoice.InvoiceCompareResultDto;
import com.manage.interior_inventory.dto.finance.invoice.InvoiceConfirmRequest;
import com.manage.interior_inventory.dto.finance.invoice.SupplierInvoiceSummaryDto;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface SupplierInvoiceService {
    InvoiceCompareResultDto uploadAndParse(Long projectId, MultipartFile file);
    void confirmInvoice(InvoiceConfirmRequest req);
    List<SupplierInvoiceSummaryDto> listByProject(Long projectId);
}
