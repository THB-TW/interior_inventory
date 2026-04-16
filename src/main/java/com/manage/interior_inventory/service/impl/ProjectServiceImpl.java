package com.manage.interior_inventory.service.impl;

import com.manage.interior_inventory.dto.project.ProjectCreateRequest;
import com.manage.interior_inventory.dto.project.ProjectResponse;
import com.manage.interior_inventory.entity.Project;
import com.manage.interior_inventory.entity.ProjectStatus;
import com.manage.interior_inventory.repository.ProjectRepository;
import com.manage.interior_inventory.service.ProjectService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;

    @Override
    @Transactional
    public ProjectResponse createProject(ProjectCreateRequest request) {
        // 產生獨立的案號 (例如: IP-202604-001)
        String yearMonthStr = YearMonth.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        String prefix = "IP-" + yearMonthStr + "-";

        String maxCode = projectRepository.findMaxProjectCodeByPrefix(prefix);
        int sequence = 1;
        if (maxCode != null && maxCode.length() > prefix.length()) {
            try {
                String seqStr = maxCode.substring(prefix.length());
                sequence = Integer.parseInt(seqStr) + 1;
            } catch (NumberFormatException e) {
                // 如果解析失敗則維持 1
            }
        }
        String generatedCaseCode = prefix + String.format("%03d", sequence);

        Project project = Project.builder()
                .projectCode(generatedCaseCode)
                .clientName(request.clientName())
                .clientPhone(request.clientPhone())
                .city(request.city())
                .district(request.district())
                .siteAddress(request.siteAddress())
                .salesUserId(request.salesUserId())
                .status(ProjectStatus.INQUIRY) // 初始狀態
                .build();

        Project savedProject = projectRepository.save(project);
        return ProjectResponse.fromEntity(savedProject);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProjectResponse> getProjects(String clientName, String city, String district, ProjectStatus status,
            Pageable pageable) {
        Specification<Project> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(clientName)) {
                predicates.add(cb.like(cb.lower(root.get("clientName")), "%" + clientName.toLowerCase() + "%"));
            }
            if (StringUtils.hasText(city)) {
                predicates.add(cb.like(cb.lower(root.get("city")), "%" + city.toLowerCase() + "%"));
            }
            if (StringUtils.hasText(district)) {
                predicates.add(cb.like(cb.lower(root.get("district")), "%" + district.toLowerCase() + "%"));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (predicates.isEmpty()) {
                return null;
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return projectRepository.findAll(spec, pageable)
                .map(ProjectResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long id) {
        Project project = getProjectEntityOrThrow(id);
        return ProjectResponse.fromEntity(project);
    }

    @Override
    @Transactional
    public ProjectResponse updateProject(Long id, ProjectCreateRequest request) {
        Project project = getProjectEntityOrThrow(id);

        project.setClientName(request.clientName());
        project.setClientPhone(request.clientPhone());
        project.setCity(request.city());
        project.setDistrict(request.district());
        project.setSiteAddress(request.siteAddress());
        project.setSalesUserId(request.salesUserId());

        Project updatedProject = projectRepository.save(project);
        return ProjectResponse.fromEntity(updatedProject);
    }

    @Override
    @Transactional
    public void updateProjectStatus(Long id, ProjectStatus nextStatus) {
        Project project = getProjectEntityOrThrow(id);

        // TODO: 在此處加入狀態機的驗證邏輯 (例如：INQUIRY 只能轉 QUOTING 等)
        // 簡單示範防呆: 不能從 CANCELLED 切換到其他狀態
        if (project.getStatus() == ProjectStatus.CANCELLED) {
            throw new IllegalStateException("已取消的案件不可變更狀態");
        }

        project.setStatus(nextStatus);
        projectRepository.save(project);
    }

    @Override
    @Transactional
    public void cancelProject(Long id) {
        Project project = getProjectEntityOrThrow(id);
        project.setStatus(ProjectStatus.CANCELLED);
        projectRepository.save(project);
    }

    private Project getProjectEntityOrThrow(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("找不到該案件，ID: " + id));
    }
}
