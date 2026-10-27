package com.ddu.paperhub.controller;

import com.ddu.paperhub.dto.*;
import com.ddu.paperhub.entity.ReportStatus;
import com.ddu.paperhub.entity.ResourceStatus;
import com.ddu.paperhub.entity.Role;
import com.ddu.paperhub.service.PaperService;
import com.ddu.paperhub.service.ReportService;
import com.ddu.paperhub.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final PaperService paperService;
    private final UserService userService;
    private final ReportService reportService;
    private final com.ddu.paperhub.service.AuditLogService auditLogService;

    // --- Paper Review Queue ---
    @GetMapping("/papers/review-queue")
    public ResponseEntity<ApiResponse<Page<PaperResponse>>> getReviewQueue(
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<PaperResponse> papers = paperService.getAdminReviewQueue(status, page, size);
        return ResponseEntity.ok(ApiResponse.success("Review queue retrieved", papers));
    }

    @PutMapping("/papers/{id}/review")
    public ResponseEntity<ApiResponse<PaperResponse>> reviewPaper(
            @PathVariable Long id,
            @Valid @RequestBody PaperReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        PaperResponse response = paperService.reviewPaper(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Paper review status updated to " + request.getStatus(), response));
    }

    @DeleteMapping("/papers/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePaper(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        paperService.deletePaper(id, userDetails.getUsername(), true);
        return ResponseEntity.ok(ApiResponse.success("Resource deleted by admin"));
    }

    // --- User & Role Management ---
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers(
            @RequestParam(required = false) Role role
    ) {
        List<UserResponse> users = (role != null) ? userService.getUsersByRole(role) : userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", users));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        UserResponse response = userService.updateUserRole(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("User role updated successfully to " + request.getRole(), response));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<Void>> toggleUserStatus(
            @PathVariable Long id,
            @RequestParam boolean enabled,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        userService.toggleUserStatus(id, enabled, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("User status updated to enabled=" + enabled));
    }

    // --- Reports Management ---
    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<Page<ReportResponse>>> getReports(
            @RequestParam(required = false) ReportStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<ReportResponse> reports = reportService.getReports(status, page, size);
        return ResponseEntity.ok(ApiResponse.success("Reports retrieved", reports));
    }

    @PutMapping("/reports/{id}/status")
    public ResponseEntity<ApiResponse<ReportResponse>> updateReportStatus(
            @PathVariable Long id,
            @RequestParam ReportStatus status
    ) {
        ReportResponse response = reportService.updateReportStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Report status updated to " + status, response));
    }

    // --- Audit Trail ---
    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<Page<com.ddu.paperhub.entity.AuditLog>>> getAuditLogs(
            @RequestParam(required = false) com.ddu.paperhub.entity.AuditAction action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<com.ddu.paperhub.entity.AuditLog> logs = auditLogService.getLogs(action, page, size);
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved", logs));
    }

    // --- Admin Dashboard Summary ---
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("paperStats", paperService.getStats());
        summary.put("totalUsers", userService.getAllUsers().size());
        summary.put("totalContributors", userService.getUsersByRole(Role.ROLE_CONTRIBUTOR).size());
        summary.put("totalStudents", userService.getUsersByRole(Role.ROLE_STUDENT).size());
        return ResponseEntity.ok(ApiResponse.success("Dashboard summary retrieved", summary));
    }
}
