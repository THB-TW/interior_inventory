package com.manage.interior_inventory.dto;

import com.manage.interior_inventory.entity.CustomerInquiry;
import com.manage.interior_inventory.entity.InquiryStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class InquiryResponse {
    private Long id;
    private String lineUserId;
    private String message;
    private InquiryStatus status;
    private String name;
    private String phone;
    private String address;
    private String workContent;
    private LocalDateTime createdAt;

    public static InquiryResponse fromEntity(CustomerInquiry entity) {
        if (entity == null) {
            return null;
        }
        return InquiryResponse.builder()
                .id(entity.getId())
                .lineUserId(entity.getLineUserId())
                .message(entity.getMessage())
                .status(entity.getStatus())
                .name(entity.getName())
                .phone(entity.getPhone())
                .address(entity.getAddress())
                .workContent(entity.getWorkContent())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
