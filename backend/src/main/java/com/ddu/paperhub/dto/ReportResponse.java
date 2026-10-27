package com.ddu.paperhub.dto;

import com.ddu.paperhub.entity.ReportStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportResponse {
    private Long id;
    private Long paperId;
    private String paperTitle;
    private Long reporterId;
    private String reporterName;
    private String reporterEmail;
    private String reason;
    private ReportStatus status;
    private LocalDateTime createdAt;
}
