package com.ddu.paperhub.dto;

import com.ddu.paperhub.entity.ResourceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaperReviewRequest {

    @NotNull(message = "Review status is required (APPROVED or REJECTED)")
    private ResourceStatus status;

    private String rejectionReason;
}
