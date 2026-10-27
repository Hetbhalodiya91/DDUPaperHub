package com.ddu.paperhub.dto;

import com.ddu.paperhub.entity.Role;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoleUpdateRequest {

    @NotNull(message = "Role must not be null")
    private Role role;
}
