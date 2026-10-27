package com.ddu.paperhub.repository;

import com.ddu.paperhub.entity.Report;
import com.ddu.paperhub.entity.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    Page<Report> findByStatus(ReportStatus status, Pageable pageable);
    List<Report> findByPaperId(Long paperId);
    long countByStatus(ReportStatus status);
}
