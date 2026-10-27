package com.ddu.paperhub.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubjectDto {
    private Long id;
    private String name;
    private String code;
    private Integer semester;
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
}
