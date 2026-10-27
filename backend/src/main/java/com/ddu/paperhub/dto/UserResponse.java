package com.ddu.paperhub.dto;

import com.ddu.paperhub.entity.Role;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private boolean enabled;
    private LocalDateTime createdAt;
}
