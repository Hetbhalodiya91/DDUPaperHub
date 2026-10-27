package com.ddu.paperhub.service;

import com.ddu.paperhub.dto.DepartmentDto;
import com.ddu.paperhub.entity.Department;
import com.ddu.paperhub.exception.ResourceNotFoundException;
import com.ddu.paperhub.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Transactional(readOnly = true)
    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DepartmentDto getDepartmentById(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        return mapToDto(dept);
    }

    public DepartmentDto mapToDto(Department dept) {
        return DepartmentDto.builder()
                .id(dept.getId())
                .name(dept.getName())
                .code(dept.getCode())
                .build();
    }
}
