package com.manage.interior_inventory.repository;

import com.manage.interior_inventory.entity.CustomerInquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerInquiryRepository extends JpaRepository<CustomerInquiry, Long> {
}
