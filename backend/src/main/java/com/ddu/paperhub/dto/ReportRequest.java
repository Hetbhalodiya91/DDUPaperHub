package com.ddu.paperhub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReportRequest {

    @NotNull(message = "Paper ID is required")
    private Long paperId;

    @NotBlank(message = "Reason for reporting is required")
    private String reason;
}
