package com.manage.interior_inventory.repository;

import com.manage.interior_inventory.entity.SupplierInvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierInvoiceItemRepository extends JpaRepository<SupplierInvoiceItem, Long> {
}
