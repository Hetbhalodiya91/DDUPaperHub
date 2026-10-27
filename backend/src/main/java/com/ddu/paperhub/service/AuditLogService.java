package com.ddu.paperhub.service;

import com.ddu.paperhub.entity.AuditAction;
import com.ddu.paperhub.entity.AuditLog;
import com.ddu.paperhub.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(AuditAction action, String actorEmail, String targetResource, String details) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .action(action)
                    .actorEmail(actorEmail != null ? actorEmail : "SYSTEM")
                    .targetResource(targetResource)
                    .details(details)
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception ex) {
            log.warn("Failed to record audit log: {}", ex.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getLogs(AuditAction action, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (action != null) {
            return auditLogRepository.findByActionOrderByCreatedAtDesc(action, pageable);
        }
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
}
