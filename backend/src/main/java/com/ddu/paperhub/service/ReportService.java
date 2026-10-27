package com.ddu.paperhub.service;

import com.ddu.paperhub.dto.ReportRequest;
import com.ddu.paperhub.dto.ReportResponse;
import com.ddu.paperhub.entity.Paper;
import com.ddu.paperhub.entity.Report;
import com.ddu.paperhub.entity.ReportStatus;
import com.ddu.paperhub.entity.User;
import com.ddu.paperhub.exception.ResourceNotFoundException;
import com.ddu.paperhub.repository.PaperRepository;
import com.ddu.paperhub.repository.ReportRepository;
import com.ddu.paperhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final ReportRepository reportRepository;
    private final PaperRepository paperRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReportResponse submitReport(ReportRequest request, String reporterEmail) {
        Paper paper = paperRepository.findById(request.getPaperId())
                .orElseThrow(() -> new ResourceNotFoundException("Paper not found with id: " + request.getPaperId()));

        User reporter = userRepository.findByEmail(reporterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Report report = Report.builder()
                .paper(paper)
                .reporter(reporter)
                .reason(request.getReason().trim())
                .status(ReportStatus.OPEN)
                .build();

        report = reportRepository.save(report);
        log.info("Report submitted by {} for paper {}: id={}", reporterEmail, paper.getId(), report.getId());

        return mapToResponse(report);
    }

    @Transactional(readOnly = true)
    public Page<ReportResponse> getReports(ReportStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        if (status != null) {
            return reportRepository.findByStatus(status, pageable).map(this::mapToResponse);
        } else {
            return reportRepository.findAll(pageable).map(this::mapToResponse);
        }
    }

    @Transactional
    public ReportResponse updateReportStatus(Long id, ReportStatus newStatus) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + id));

        report.setStatus(newStatus);
        report = reportRepository.save(report);
        log.info("Report id={} status updated to {}", id, newStatus);

        return mapToResponse(report);
    }

    public ReportResponse mapToResponse(Report report) {
        return ReportResponse.builder()
                .id(report.getId())
                .paperId(report.getPaper().getId())
                .paperTitle(report.getPaper().getTitle())
                .reporterId(report.getReporter().getId())
                .reporterName(report.getReporter().getName())
                .reporterEmail(report.getReporter().getEmail())
                .reason(report.getReason())
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .build();
    }
}
