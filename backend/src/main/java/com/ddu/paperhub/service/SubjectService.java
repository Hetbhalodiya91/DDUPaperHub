package com.ddu.paperhub.service;

import com.ddu.paperhub.dto.SubjectDto;
import com.ddu.paperhub.entity.Subject;
import com.ddu.paperhub.exception.ResourceNotFoundException;
import com.ddu.paperhub.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;

    @Transactional(readOnly = true)
    public List<SubjectDto> getAllSubjects() {
        return subjectRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SubjectDto> getSubjectsByDepartmentAndSemester(Long departmentId, Integer semester) {
        List<Subject> subjects;
        if (departmentId != null && semester != null) {
            subjects = subjectRepository.findByDepartmentIdAndSemester(departmentId, semester);
        } else if (departmentId != null) {
            subjects = subjectRepository.findByDepartmentId(departmentId);
        } else if (semester != null) {
            subjects = subjectRepository.findBySemester(semester);
        } else {
            subjects = subjectRepository.findAll();
        }
        return subjects.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SubjectDto getSubjectById(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));
        return mapToDto(subject);
    }

    public SubjectDto mapToDto(Subject subject) {
        return SubjectDto.builder()
                .id(subject.getId())
                .name(subject.getName())
                .code(subject.getCode())
                .semester(subject.getSemester())
                .departmentId(subject.getDepartment().getId())
                .departmentName(subject.getDepartment().getName())
                .departmentCode(subject.getDepartment().getCode())
                .build();
    }
}
