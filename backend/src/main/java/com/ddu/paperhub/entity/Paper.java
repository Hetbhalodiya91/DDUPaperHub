package com.ddu.paperhub.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "papers", indexes = {
    @Index(name = "idx_paper_status", columnList = "status"),
    @Index(name = "idx_paper_subject", columnList = "subject_id"),
    @Index(name = "idx_paper_year", columnList = "examYear")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Paper {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ResourceType resourceType;

    @Column(nullable = false)
    private Integer examYear; // e.g. 2024, 2023

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "uploader_id", nullable = false)
    private User uploader;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ResourceStatus status = ResourceStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(nullable = false, length = 255)
    private String fileKey;

    @Column(length = 255)
    private String thumbnailKey;

    @Column(nullable = false, length = 255)
    private String fileName;

    @Column(nullable = false)
    private Long fileSizeBytes;

    @Column(nullable = false, length = 100)
    @Builder.Default
    private String contentType = "application/pdf";

    @Column(nullable = false)
    @Builder.Default
    private Long downloadCount = 0L;

    @Column(nullable = false)
    @Builder.Default
    private Long viewCount = 0L;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime reviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_id")
    private User reviewedBy;
}
