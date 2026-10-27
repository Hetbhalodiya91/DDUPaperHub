package com.ddu.paperhub.dto;

import com.ddu.paperhub.entity.ResourceType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaperUploadRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Resource type is required")
    private ResourceType resourceType;

    @NotNull(message = "Exam year is required")
    @Min(value = 1990, message = "Exam year cannot be earlier than 1990")
    @Max(value = 2100, message = "Exam year is invalid")
    private Integer examYear;

    @NotNull(message = "Subject ID is required")
    private Long subjectId;
}
