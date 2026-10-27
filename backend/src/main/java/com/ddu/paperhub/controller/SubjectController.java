package com.ddu.paperhub.controller;

import com.ddu.paperhub.dto.ApiResponse;
import com.ddu.paperhub.dto.SubjectDto;
import com.ddu.paperhub.service.SubjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectService subjectService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SubjectDto>>> getSubjects(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Integer semester
    ) {
        List<SubjectDto> subjects = subjectService.getSubjectsByDepartmentAndSemester(departmentId, semester);
        return ResponseEntity.ok(ApiResponse.success("Subjects retrieved", subjects));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubjectDto>> getSubjectById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Subject retrieved", subjectService.getSubjectById(id)));
    }
}
