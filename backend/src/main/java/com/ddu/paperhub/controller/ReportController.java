package com.ddu.paperhub.controller;

import com.ddu.paperhub.dto.ApiResponse;
import com.ddu.paperhub.dto.ReportRequest;
import com.ddu.paperhub.dto.ReportResponse;
import com.ddu.paperhub.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<ApiResponse<ReportResponse>> submitReport(
            @Valid @RequestBody ReportRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        ReportResponse response = reportService.submitReport(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thank you. Your report has been submitted to moderators for review.", response));
    }
}
