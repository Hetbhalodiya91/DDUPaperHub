package com.ddu.paperhub.repository;

import com.ddu.paperhub.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByDepartmentId(Long departmentId);
    List<Subject> findBySemester(Integer semester);
    List<Subject> findByDepartmentIdAndSemester(Long departmentId, Integer semester);
    Optional<Subject> findByCodeIgnoreCase(String code);
}
