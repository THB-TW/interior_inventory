package com.manage.interior_inventory.repository;

import com.manage.interior_inventory.entity.SupplierInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface SupplierInvoiceRepository extends JpaRepository<SupplierInvoice, Long> {
    List<SupplierInvoice> findByProject_Id(Long projectId);

    List<SupplierInvoice> findByProject_IdOrderByCreatedAtDesc(Long projectId);

    @Query("SELECT si FROM SupplierInvoice si LEFT JOIN FETCH si.items WHERE si.id = :id")
    Optional<SupplierInvoice> findByIdWithItems(@Param("id") Long id);

}
