package com.manage.interior_inventory.service.impl;

import com.manage.interior_inventory.dto.finance.invoice.InvoiceCompareResultDto;
import com.manage.interior_inventory.dto.finance.invoice.InvoiceConfirmRequest;
import com.manage.interior_inventory.dto.finance.invoice.InvoiceItemCompareDto;
import com.manage.interior_inventory.dto.finance.invoice.SupplierInvoiceSummaryDto;
import com.manage.interior_inventory.entity.CaseMaterial;
import com.manage.interior_inventory.entity.Project;
import com.manage.interior_inventory.entity.SupplierInvoice;
import com.manage.interior_inventory.entity.SupplierInvoiceItem;
import com.manage.interior_inventory.entity.enums.InvoiceItemMatchStatus;
import com.manage.interior_inventory.entity.enums.InvoiceStatus;
import com.manage.interior_inventory.repository.CaseMaterialRepository;
import com.manage.interior_inventory.repository.ProjectRepository;
import com.manage.interior_inventory.repository.SupplierInvoiceRepository;
import com.manage.interior_inventory.service.SupplierInvoiceService;
import com.manage.interior_inventory.util.PdfBoxOcrParser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupplierInvoiceServiceImpl implements SupplierInvoiceService {

    private final SupplierInvoiceRepository invoiceRepository;
    private final ProjectRepository projectRepository;
    private final CaseMaterialRepository caseMaterialRepository;

    @Value("${app.upload.invoice-dir:uploads/invoices}")
    private String uploadDir;

    @Override
    @Transactional
    public InvoiceCompareResultDto uploadAndParse(Long projectId, MultipartFile file) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

        String filename = projectId + "_" + System.currentTimeMillis() + "_" + UUID.randomUUID() + ".pdf";
        Path targetLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(targetLocation);
            Files.copy(file.getInputStream(), targetLocation.resolve(filename));
        } catch (Exception e) {
            log.error("Could not store file " + filename, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to save file", e);
        }

        PdfBoxOcrParser.ParseResult parseResult = PdfBoxOcrParser.parse(file);

        List<CaseMaterial> caseMaterials = caseMaterialRepository.findByProject_Id(projectId);

        SupplierInvoice invoice = SupplierInvoice.builder()
                .project(project)
                .supplierName(parseResult.supplierName())
                .invoiceNumber("INV-" + System.currentTimeMillis())
                .invoiceDate(LocalDate.now())
                .status(InvoiceStatus.PENDING_REVIEW)
                .pdfPath(targetLocation.resolve(filename).toString())
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<InvoiceItemCompareDto> itemDtos = new ArrayList<>();
        int okCount = 0, mismatchCount = 0, notFoundCount = 0;

        for (PdfBoxOcrParser.ParsedInvoiceItem pItem : parseResult.items()) {
            totalAmount = totalAmount.add(pItem.totalPrice());

            InvoiceItemMatchStatus matchStatus = InvoiceItemMatchStatus.NOT_FOUND;
            Long matchedCaseMaterialId = null;
            BigDecimal systemQty = null;
            BigDecimal systemUnitPrice = null;

            if (!pItem.isReturn()) {
                String normName = normalizeMaterialName(pItem.materialName());
                Optional<CaseMaterial> matchOpt = caseMaterials.stream()
                        .filter(cm -> normalizeMaterialName(cm.getMaterial().getName()).equals(normName))
                        .findFirst();

                if (matchOpt.isPresent()) {
                    CaseMaterial match = matchOpt.get();
                    matchedCaseMaterialId = match.getId();
                    systemQty = BigDecimal.valueOf(match.getQuantity());
                    systemUnitPrice = match.getUnitPrice();

                    if (systemQty.compareTo(pItem.quantity()) != 0) {
                        matchStatus = InvoiceItemMatchStatus.QTY_MISMATCH;
                    } else if (systemUnitPrice != null && systemUnitPrice.compareTo(pItem.unitPrice()) != 0) {
                        matchStatus = InvoiceItemMatchStatus.PRICE_MISMATCH;
                    } else {
                        matchStatus = InvoiceItemMatchStatus.OK;
                    }
                } else {
                    matchStatus = InvoiceItemMatchStatus.NOT_FOUND;
                }
            } else {
                matchStatus = InvoiceItemMatchStatus.OK;
            }

            if (matchStatus == InvoiceItemMatchStatus.OK) okCount++;
            else if (matchStatus == InvoiceItemMatchStatus.NOT_FOUND) notFoundCount++;
            else mismatchCount++;

            SupplierInvoiceItem item = SupplierInvoiceItem.builder()
                    .materialName(pItem.materialName())
                    .unit(pItem.unit())
                    .quantity(pItem.quantity())
                    .unitPrice(pItem.unitPrice())
                    .totalPrice(pItem.totalPrice())
                    .isReturn(pItem.isReturn())
                    .matchStatus(matchStatus)
                    .caseMaterialId(matchedCaseMaterialId)
                    .build();

            invoice.addItem(item);

            itemDtos.add(new InvoiceItemCompareDto(
                    pItem.materialName(),
                    "",
                    pItem.unit(),
                    pItem.quantity(),
                    pItem.unitPrice(),
                    pItem.totalPrice(),
                    systemQty,
                    systemUnitPrice,
                    matchStatus,
                    matchedCaseMaterialId,
                    pItem.isReturn()
            ));
        }

        invoice.setTotalAmount(totalAmount);
        invoiceRepository.save(invoice);

        return new InvoiceCompareResultDto(
                invoice.getId(),
                invoice.getSupplierName(),
                invoice.getInvoiceNumber(),
                invoice.getInvoiceDate(),
                invoice.getTotalAmount(),
                itemDtos,
                okCount,
                mismatchCount,
                notFoundCount
        );
    }

    @Override
    @Transactional
    public void confirmInvoice(InvoiceConfirmRequest req) {
        SupplierInvoice invoice = invoiceRepository.findById(req.tempInvoiceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found"));

        if (!invoice.getProject().getId().equals(req.projectId())) {
             throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice does not belong to project");
        }

        if (invoice.getStatus() == InvoiceStatus.CONFIRMED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice is already confirmed");
        }

        invoice.setStatus(InvoiceStatus.CONFIRMED);
        invoice.setConfirmedAt(LocalDateTime.now());
        invoiceRepository.save(invoice);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierInvoiceSummaryDto> listByProject(Long projectId) {
        return invoiceRepository.findByProjectIdOrderByUploadedAtDesc(projectId).stream()
                .map(inv -> {
                    int ok = 0, mismatch = 0, notFound = 0;
                    for (SupplierInvoiceItem item : inv.getItems()) {
                        if (item.getMatchStatus() == InvoiceItemMatchStatus.OK) ok++;
                        else if (item.getMatchStatus() == InvoiceItemMatchStatus.NOT_FOUND) notFound++;
                        else mismatch++;
                    }
                    return new SupplierInvoiceSummaryDto(
                            inv.getId(),
                            inv.getSupplierName(),
                            inv.getInvoiceNumber(),
                            inv.getInvoiceDate(),
                            inv.getTotalAmount(),
                            inv.getStatus(),
                            inv.getUploadedAt(),
                            ok,
                            mismatch,
                            notFound
                    );
                })
                .collect(Collectors.toList());
    }

    private String normalizeMaterialName(String name) {
        if (name == null) return "";
        return name.trim().replaceAll("　", "").replaceAll("\\s", "").replace("*", "×");
    }
}
