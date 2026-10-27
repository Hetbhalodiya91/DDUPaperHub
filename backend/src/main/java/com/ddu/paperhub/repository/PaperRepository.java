package com.ddu.paperhub.repository;

import com.ddu.paperhub.entity.Paper;
import com.ddu.paperhub.entity.ResourceStatus;
import com.ddu.paperhub.entity.ResourceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaperRepository extends JpaRepository<Paper, Long> {

    @Query("SELECT p FROM Paper p " +
           "JOIN p.subject s " +
           "JOIN s.department d " +
           "WHERE (:status IS NULL OR p.status = :status) " +
           "AND (:departmentId IS NULL OR d.id = :departmentId) " +
           "AND (:semester IS NULL OR s.semester = :semester) " +
           "AND (:subjectId IS NULL OR s.id = :subjectId) " +
           "AND (:resourceType IS NULL OR p.resourceType = :resourceType) " +
           "AND (:examYear IS NULL OR p.examYear = :examYear) " +
           "AND (:keyword IS NULL OR :keyword = '' OR " +
           "     LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "     LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "     LOWER(s.code) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Paper> searchPapers(
            @Param("status") ResourceStatus status,
            @Param("departmentId") Long departmentId,
            @Param("semester") Integer semester,
            @Param("subjectId") Long subjectId,
            @Param("resourceType") ResourceType resourceType,
            @Param("examYear") Integer examYear,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    Page<Paper> findByStatus(ResourceStatus status, Pageable pageable);

    Page<Paper> findByUploaderId(Long uploaderId, Pageable pageable);

    Page<Paper> findByUploaderIdAndStatus(Long uploaderId, ResourceStatus status, Pageable pageable);

    long countByStatus(ResourceStatus status);

    List<Paper> findTop5ByStatusOrderByCreatedAtDesc(ResourceStatus status);
}
