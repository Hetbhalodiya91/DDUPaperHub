package com.ddu.paperhub.controller;

import com.ddu.paperhub.dto.ApiResponse;
import com.ddu.paperhub.dto.PaperResponse;
import com.ddu.paperhub.dto.PaperUploadRequest;
import com.ddu.paperhub.entity.ResourceStatus;
import com.ddu.paperhub.entity.ResourceType;
import com.ddu.paperhub.exception.BadRequestException;
import com.ddu.paperhub.exception.ResourceNotFoundException;
import com.ddu.paperhub.service.PaperService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/papers")
@RequiredArgsConstructor
public class PaperController {

    private final PaperService paperService;

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<PaperResponse>>> searchPapers(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) ResourceType resourceType,
            @RequestParam(required = false) Integer examYear,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        Page<PaperResponse> papers = paperService.searchApprovedPapers(
                departmentId, semester, subjectId, resourceType, examYear, keyword, page, size
        );
        return ResponseEntity.ok(ApiResponse.success("Papers retrieved successfully", papers));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaperResponse>> getPaperById(@PathVariable Long id) {
        try {
            PaperResponse paper = paperService.getPaperById(id);
            return ResponseEntity.ok(ApiResponse.success("Paper retrieved", paper));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/preview")
    public ResponseEntity<Resource> previewPaper(@PathVariable Long id) {
        PaperResponse paper = paperService.getPaperById(id);
        Resource file = paperService.loadPaperForPreview(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(paper.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + paper.getFileName() + "\"")
                .body(file);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadPaper(@PathVariable Long id) {
        PaperResponse paper = paperService.getPaperById(id);
        Resource file = paperService.loadPaperForDownload(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(paper.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + paper.getFileName() + "\"")
                .body(file);
    }

    @GetMapping("/{id}/thumbnail")
    public ResponseEntity<Resource> getPaperThumbnail(@PathVariable Long id) {
        Resource thumbnail = paperService.loadPaperThumbnail(id);
        if (thumbnail == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(thumbnail);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PaperResponse>> uploadPaper(
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("resourceType") ResourceType resourceType,
            @RequestParam("examYear") Integer examYear,
            @RequestParam("subjectId") Long subjectId,
            @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Validate using the DTO-level constraints so rejected papers never reach the DB
        PaperUploadRequest request = PaperUploadRequest.builder()
                .title(title)
                .description(description)
                .resourceType(resourceType)
                .examYear(examYear)
                .subjectId(subjectId)
                .build();

        // Spring validation — triggers MethodArgumentNotValidException on constraint failure
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new BadRequestException("Title is required");
        }
        if (request.getExamYear() == null || request.getExamYear() < 1990 || request.getExamYear() > 2100) {
            throw new BadRequestException("Exam year must be between 1990 and 2100");
        }
        if (request.getSubjectId() == null) {
            throw new BadRequestException("Subject ID is required");
        }

        PaperResponse response = paperService.uploadPaper(request, file, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Paper submitted successfully! It will be visible after admin review.", response));
    }

    @GetMapping("/my-submissions")
    public ResponseEntity<ApiResponse<Page<PaperResponse>>> getMySubmissions(
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Page<PaperResponse> submissions = paperService.getMySubmissions(userDetails.getUsername(), status, page, size);
        return ResponseEntity.ok(ApiResponse.success("Submissions retrieved", submissions));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePaper(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        paperService.deletePaper(id, userDetails.getUsername(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Resource deleted successfully"));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success("Stats retrieved", paperService.getStats()));
    }
}
