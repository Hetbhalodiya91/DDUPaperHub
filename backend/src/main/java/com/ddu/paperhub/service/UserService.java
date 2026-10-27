package com.ddu.paperhub.service;

import com.ddu.paperhub.dto.RoleUpdateRequest;
import com.ddu.paperhub.dto.UserResponse;
import com.ddu.paperhub.entity.Role;
import com.ddu.paperhub.entity.User;
import com.ddu.paperhub.exception.BadRequestException;
import com.ddu.paperhub.exception.ResourceNotFoundException;
import com.ddu.paperhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public User getCurrentUserEntity(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    @Transactional(readOnly = true)
    public UserResponse getUserProfile(String email) {
        User user = getCurrentUserEntity(email);
        return mapToUserResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByRole(Role role) {
        return userRepository.findByRole(role).stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse updateUserRole(Long userId, RoleUpdateRequest request, String adminEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (user.getEmail().equalsIgnoreCase(adminEmail) && request.getRole() != Role.ROLE_ADMIN) {
            throw new BadRequestException("You cannot demote your own admin account.");
        }

        user.setRole(request.getRole());
        user = userRepository.save(user);
        log.info("Admin {} changed role of user {} to {}", adminEmail, user.getEmail(), user.getRole());

        auditLogService.record(com.ddu.paperhub.entity.AuditAction.USER_ROLE_CHANGED, adminEmail, "User:" + user.getId(), "New Role: " + request.getRole());

        return mapToUserResponse(user);
    }

    @Transactional
    public void toggleUserStatus(Long userId, boolean enabled, String adminEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (user.getEmail().equalsIgnoreCase(adminEmail)) {
            throw new BadRequestException("You cannot disable your own admin account.");
        }

        user.setEnabled(enabled);
        userRepository.save(user);
        log.info("Admin {} set enabled={} for user {}", adminEmail, enabled, user.getEmail());

        auditLogService.record(com.ddu.paperhub.entity.AuditAction.USER_STATUS_CHANGED, adminEmail, "User:" + user.getId(), "Enabled: " + enabled);
    }

    public UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
