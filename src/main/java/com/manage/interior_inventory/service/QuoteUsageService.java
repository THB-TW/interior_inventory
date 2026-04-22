package com.manage.interior_inventory.service;

import com.manage.interior_inventory.dto.quote.QuoteMaterialLineResponse;
import com.manage.interior_inventory.dto.quote.QuoteMaterialRequset;
import com.manage.interior_inventory.dto.quote.QuoteUsageResponse;

import java.util.List;

public interface QuoteUsageService {
        List<QuoteUsageResponse> getQuoteUsageOverview();

        List<QuoteUsageResponse> getProjectQuoteUsage(Long projectId);

        QuoteUsageResponse createProjectMaterial(Long projectId,
                        QuoteMaterialRequset request);

        QuoteUsageResponse updateProjectMaterial(Long projectId,
                        Long caseMaterialId,
                        QuoteMaterialRequset request);

        void deleteProjectMaterial(Long projectId, Long caseMaterialId);

        List<QuoteMaterialLineResponse> getCaseMaterialLines(Long projectId);

        QuoteUsageResponse confirmOrderBatch(Long projectId);

}
