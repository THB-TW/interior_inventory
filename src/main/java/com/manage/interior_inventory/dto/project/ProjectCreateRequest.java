package com.manage.interior_inventory.dto.project;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ProjectCreateRequest(
                @NotBlank(message = "客戶姓名為必填") @Size(max = 100, message = "客戶姓名不能超過 100 字元") String clientName,

                @Size(max = 30, message = "電話長度不能超過 30 字元") String clientPhone,

                @NotBlank(message = "縣市為必填") @Size(max = 50, message = "縣市名稱不能超過 50 字元") String city,

                @Size(max = 50, message = "行政區名稱不能超過 50 字元") String district,

                @NotBlank(message = "詳細地址為必填") @Size(max = 255, message = "詳細地址不能超過 255 字元") String siteAddress,

                @NotNull(message = "負責業務(Sales)為必填") Long salesUserId) {
}
