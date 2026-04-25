package com.manage.interior_inventory.repository;

import com.manage.interior_inventory.entity.SupplierInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SupplierInvoiceRepository extends JpaRepository<SupplierInvoice, Long> {
    List<SupplierInvoice> findByProjectId(Long projectId);
    List<SupplierInvoice> findByProjectIdOrderByUploadedAtDesc(Long projectId);
}
