package com.manage.interior_inventory.controller;

import com.manage.interior_inventory.common.ApiResponse;
import com.manage.interior_inventory.dto.material.MaterialResponse;
import com.manage.interior_inventory.service.MaterialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/materials")
@RequiredArgsConstructor
@Tag(name = "材料管理")
public class MaterialController {

    private final MaterialService materialService;

    @GetMapping
    @Operation(summary = "取得所有材料清單")
    public ApiResponse<List<MaterialResponse>> getAllMaterials() {
        return ApiResponse.success("成功取得材料清單", materialService.getAllMaterials());
    }
}