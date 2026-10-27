package com.ddu.paperhub.service;

import com.ddu.paperhub.dto.PaperResponse;
import com.ddu.paperhub.dto.PaperReviewRequest;
import com.ddu.paperhub.dto.PaperUploadRequest;
import com.ddu.paperhub.entity.*;
import com.ddu.paperhub.exception.BadRequestException;
import com.ddu.paperhub.exception.ResourceNotFoundException;
import com.ddu.paperhub.repository.PaperRepository;
import com.ddu.paperhub.repository.SubjectRepository;
import com.ddu.paperhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaperService {

    private final PaperRepository paperRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final PdfThumbnailService pdfThumbnailService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public Page<PaperResponse> searchApprovedPapers(
            Long departmentId,
            Integer semester,
            Long subjectId,
            ResourceType resourceType,
            Integer examYear,
            String keyword,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return paperRepository.searchPapers(
                ResourceStatus.APPROVED,
                departmentId,
                semester,
                subjectId,
                resourceType,
                examYear,
                keyword,
                pageable
        ).map(this::mapToResponse);
    }

    @Transactional
    public PaperResponse uploadPaper(PaperUploadRequest request, MultipartFile file, String uploaderEmail) {
        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded file cannot be empty.");
        }

        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || !originalFileName.toLowerCase().endsWith(".pdf")) {
            throw new BadRequestException("Only PDF documents (.pdf) are permitted.");
        }

        User uploader = userRepository.findByEmail(uploaderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Uploader user not found"));

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + request.getSubjectId()));

        String fileKey = fileStorageService.storeFile(file);

        String thumbnailKey = null;
        try {
            byte[] thumbBytes = pdfThumbnailService.generateThumbnail(file.getInputStream());
            if (thumbBytes != null && thumbBytes.length > 0) {
                thumbnailKey = fileStorageService.storeBytes(thumbBytes, "thumb.jpg", "image/jpeg");
            }
        } catch (Exception ex) {
            log.warn("Thumbnail generation skipped: {}", ex.getMessage());
        }

        Paper paper = Paper.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .resourceType(request.getResourceType())
                .examYear(request.getExamYear())
                .subject(subject)
                .uploader(uploader)
                .status(ResourceStatus.PENDING) // By default pending review
                .fileKey(fileKey)
                .thumbnailKey(thumbnailKey)
                .fileName(originalFileName)
                .fileSizeBytes(file.getSize())
                .contentType("application/pdf")
                .downloadCount(0L)
                .viewCount(0L)
                .build();

        paper = paperRepository.save(paper);
        log.info("Paper uploaded: id={}, title={}, uploader={}", paper.getId(), paper.getTitle(), uploaderEmail);

        auditLogService.record(AuditAction.PAPER_UPLOADED, uploaderEmail, "Paper:" + paper.getId(), "Title: " + paper.getTitle());

        return mapToResponse(paper);
    }

    @Transactional(readOnly = true)
    public PaperResponse getPaperById(Long id) {
        Paper paper = paperRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paper not found with id: " + id));
        return mapToResponse(paper);
    }

    @Transactional
    public Resource loadPaperForPreview(Long id) {
        Paper paper = paperRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paper not found with id: " + id));

        paper.setViewCount(paper.getViewCount() + 1);
        paperRepository.save(paper);

        return fileStorageService.loadFileAsResource(paper.getFileKey());
    }

    @Transactional
    public Resource loadPaperForDownload(Long id) {
        Paper paper = paperRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paper not found with id: " + id));

        paper.setDownloadCount(paper.getDownloadCount() + 1);
        paperRepository.save(paper);

        return fileStorageService.loadFileAsResource(paper.getFileKey());
    }

    @Transactional(readOnly = true)
    public Page<PaperResponse> getMySubmissions(String email, ResourceStatus status, int page, int size) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        if (status != null) {
            return paperRepository.findByUploaderIdAndStatus(user.getId(), status, pageable).map(this::mapToResponse);
        } else {
            return paperRepository.findByUploaderId(user.getId(), pageable).map(this::mapToResponse);
        }
    }

    @Transactional(readOnly = true)
    public Page<PaperResponse> getAdminReviewQueue(ResourceStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        ResourceStatus filterStatus = status != null ? status : ResourceStatus.PENDING;
        return paperRepository.findByStatus(filterStatus, pageable).map(this::mapToResponse);
    }

    @Transactional
    public PaperResponse reviewPaper(Long id, PaperReviewRequest request, String reviewerEmail) {
        Paper paper = paperRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paper not found with id: " + id));

        User reviewer = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer user not found"));

        paper.setStatus(request.getStatus());
        paper.setReviewedBy(reviewer);
        paper.setReviewedAt(LocalDateTime.now());

        if (request.getStatus() == ResourceStatus.REJECTED) {
            paper.setRejectionReason(request.getRejectionReason());
        } else {
            paper.setRejectionReason(null);
        }

        paper = paperRepository.save(paper);
        log.info("Paper id={} reviewed by {}: status={}", id, reviewerEmail, request.getStatus());

        AuditAction action = request.getStatus() == ResourceStatus.APPROVED ? AuditAction.PAPER_APPROVED : AuditAction.PAPER_REJECTED;
        auditLogService.record(action, reviewerEmail, "Paper:" + id, "Status: " + request.getStatus() + (request.getRejectionReason() != null ? " Reason: " + request.getRejectionReason() : ""));

        return mapToResponse(paper);
    }

    @Transactional
    public void deletePaper(Long id, String requesterEmail, boolean isAdmin) {
        Paper paper = paperRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paper not found with id: " + id));

        if (!isAdmin) {
            if (!paper.getUploader().getEmail().equalsIgnoreCase(requesterEmail)) {
                throw new AccessDeniedException("You can only delete your own submissions.");
            }
            if (paper.getStatus() != ResourceStatus.PENDING) {
                throw new BadRequestException("You can only delete submissions that are still pending review.");
            }
        }

        fileStorageService.deleteFile(paper.getFileKey());
        if (paper.getThumbnailKey() != null) {
            fileStorageService.deleteFile(paper.getThumbnailKey());
        }
        paperRepository.delete(paper);
        log.info("Paper id={} deleted by {}", id, requesterEmail);

        auditLogService.record(AuditAction.PAPER_DELETED, requesterEmail, "Paper:" + id, "Title: " + paper.getTitle());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalApproved", paperRepository.countByStatus(ResourceStatus.APPROVED));
        stats.put("totalPending", paperRepository.countByStatus(ResourceStatus.PENDING));
        stats.put("totalRejected", paperRepository.countByStatus(ResourceStatus.REJECTED));
        return stats;
    }

    @Transactional(readOnly = true)
    public Resource loadPaperThumbnail(Long id) {
        Paper paper = paperRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paper not found with id: " + id));

        if (paper.getThumbnailKey() != null) {
            try {
                return fileStorageService.loadFileAsResource(paper.getThumbnailKey());
            } catch (Exception ex) {
                log.warn("Thumbnail file missing: {}", paper.getThumbnailKey());
            }
        }
        return null;
    }

    public PaperResponse mapToResponse(Paper paper) {
        return PaperResponse.builder()
                .id(paper.getId())
                .title(paper.getTitle())
                .description(paper.getDescription())
                .resourceType(paper.getResourceType())
                .examYear(paper.getExamYear())
                .subjectId(paper.getSubject().getId())
                .subjectName(paper.getSubject().getName())
                .subjectCode(paper.getSubject().getCode())
                .semester(paper.getSubject().getSemester())
                .departmentId(paper.getSubject().getDepartment().getId())
                .departmentName(paper.getSubject().getDepartment().getName())
                .departmentCode(paper.getSubject().getDepartment().getCode())
                .uploaderId(paper.getUploader().getId())
                .uploaderName(paper.getUploader().getName())
                .status(paper.getStatus())
                .rejectionReason(paper.getRejectionReason())
                .fileName(paper.getFileName())
                .thumbnailKey(paper.getThumbnailKey())
                .fileSizeBytes(paper.getFileSizeBytes())
                .contentType(paper.getContentType())
                .downloadCount(paper.getDownloadCount())
                .viewCount(paper.getViewCount())
                .createdAt(paper.getCreatedAt())
                .reviewedAt(paper.getReviewedAt())
                .build();
    }
}
