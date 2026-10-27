package com.ddu.paperhub.repository;

import com.ddu.paperhub.entity.AuditAction;
import com.ddu.paperhub.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<AuditLog> findByActionOrderByCreatedAtDesc(AuditAction action, Pageable pageable);
}
