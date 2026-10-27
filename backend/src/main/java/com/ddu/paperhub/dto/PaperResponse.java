package com.ddu.paperhub.dto;

import com.ddu.paperhub.entity.ResourceStatus;
import com.ddu.paperhub.entity.ResourceType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaperResponse {
    private Long id;
    private String title;
    private String description;
    private ResourceType resourceType;
    private Integer examYear;
    private Long subjectId;
    private String subjectName;
    private String subjectCode;
    private Integer semester;
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private Long uploaderId;
    private String uploaderName;
    private ResourceStatus status;
    private String rejectionReason;
    private String fileName;
    private String thumbnailKey;
    private Long fileSizeBytes;
    private String contentType;
    private Long downloadCount;
    private Long viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
}
