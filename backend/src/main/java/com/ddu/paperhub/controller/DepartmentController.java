package com.ddu.paperhub.controller;

import com.ddu.paperhub.dto.ApiResponse;
import com.ddu.paperhub.dto.DepartmentDto;
import com.ddu.paperhub.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DepartmentDto>>> getAllDepartments() {
        return ResponseEntity.ok(ApiResponse.success("Departments retrieved", departmentService.getAllDepartments()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DepartmentDto>> getDepartmentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Department retrieved", departmentService.getDepartmentById(id)));
    }
}
