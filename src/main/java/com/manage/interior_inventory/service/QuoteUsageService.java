package com.manage.interior_inventory.service;

import com.manage.interior_inventory.dto.quote.QuoteUsageResponse;

import java.util.List;

public interface QuoteUsageService {
    List<QuoteUsageResponse> getQuoteUsageOverview();
}
