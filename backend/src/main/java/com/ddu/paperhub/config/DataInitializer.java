package com.ddu.paperhub.config;

import com.ddu.paperhub.entity.*;
import com.ddu.paperhub.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final SubjectRepository subjectRepository;
    private final PaperRepository paperRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Value("${storage.local.upload-dir:./uploads}")
    private String uploadDir;

    @Override
    @Transactional
    public void run(String... args) {
        migrateConstraints();
        seedUsers();
        seedDepartmentsAndSubjects();
        seedSamplePaper();
    }

    private void migrateConstraints() {
        try {
            jdbcTemplate.execute("ALTER TABLE papers DROP CONSTRAINT IF EXISTS papers_resource_type_check");
        } catch (Exception e) {
            log.debug("Constraint migration skipped: {}", e.getMessage());
        }
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            log.info("Seeding initial users (Admin, Contributor, Student)...");

            User admin = User.builder()
                    .name("DDU Admin")
                    .email("admin@ddu.ac.in")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(Role.ROLE_ADMIN)
                    .enabled(true)
                    .build();

            User contributor = User.builder()
                    .name("Professor Sharma")
                    .email("contributor@ddu.ac.in")
                    .password(passwordEncoder.encode("Contributor@123"))
                    .role(Role.ROLE_CONTRIBUTOR)
                    .enabled(true)
                    .build();

            User student = User.builder()
                    .name("DDU Student")
                    .email("student@ddu.ac.in")
                    .password(passwordEncoder.encode("Student@123"))
                    .role(Role.ROLE_STUDENT)
                    .enabled(true)
                    .build();

            userRepository.saveAll(List.of(admin, contributor, student));
            log.info("Users seeded successfully.");
        }
    }

    private void seedDepartmentsAndSubjects() {
        if (departmentRepository.count() == 0) {
            log.info("Seeding engineering departments and subjects...");

            Department ce = departmentRepository.save(Department.builder().name("Computer Engineering").code("CE").build());
            Department it = departmentRepository.save(Department.builder().name("Information Technology").code("IT").build());
            Department ec = departmentRepository.save(Department.builder().name("Electronics & Communication").code("EC").build());
            Department ch = departmentRepository.save(Department.builder().name("Chemical Engineering").code("CH").build());
            Department mh = departmentRepository.save(Department.builder().name("Mechanical Engineering").code("MH").build());
            Department cl = departmentRepository.save(Department.builder().name("Civil Engineering").code("CL").build());

            // Computer Engineering Subjects
            subjectRepository.save(Subject.builder().name("Mathematics - I").code("CE101").semester(1).department(ce).build());
            subjectRepository.save(Subject.builder().name("Data Structures & Algorithms").code("CE301").semester(3).department(ce).build());
            subjectRepository.save(Subject.builder().name("Digital Logic & Design").code("CE302").semester(3).department(ce).build());
            subjectRepository.save(Subject.builder().name("Operating Systems").code("CE401").semester(4).department(ce).build());
            subjectRepository.save(Subject.builder().name("Database Management Systems").code("CE402").semester(4).department(ce).build());
            subjectRepository.save(Subject.builder().name("Theory of Computation").code("CE501").semester(5).department(ce).build());
            subjectRepository.save(Subject.builder().name("Computer Networks").code("CE502").semester(5).department(ce).build());
            subjectRepository.save(Subject.builder().name("Design & Analysis of Algorithms").code("CE601").semester(6).department(ce).build());
            subjectRepository.save(Subject.builder().name("Compiler Design").code("CE602").semester(6).department(ce).build());
            subjectRepository.save(Subject.builder().name("Artificial Intelligence").code("CE701").semester(7).department(ce).build());

            // IT Subjects
            subjectRepository.save(Subject.builder().name("Object Oriented Programming with Java").code("IT301").semester(3).department(it).build());
            subjectRepository.save(Subject.builder().name("Web Technology").code("IT401").semester(4).department(it).build());
            subjectRepository.save(Subject.builder().name("Cloud Computing").code("IT601").semester(6).department(it).build());

            // EC Subjects
            subjectRepository.save(Subject.builder().name("Signals & Systems").code("EC301").semester(3).department(ec).build());
            subjectRepository.save(Subject.builder().name("Microprocessors & Microcontrollers").code("EC501").semester(5).department(ec).build());

            log.info("Departments and subjects seeded.");
        }
    }

    private void seedSamplePaper() {
        if (paperRepository.count() == 0) {
            log.info("Creating a sample paper and PDF...");
            try {
                // Ensure upload folder exists and create a valid lightweight sample PDF file
                Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
                Files.createDirectories(uploadPath);

                String sampleFileName = "sample-os-midsem.pdf";
                Path sampleFilePath = uploadPath.resolve(sampleFileName);

                if (!Files.exists(sampleFilePath)) {
                    // Minimal valid PDF byte sequence
                    String minimalPdf = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF\n";
                    Files.write(sampleFilePath, minimalPdf.getBytes(StandardCharsets.US_ASCII));
                }

                User contributor = userRepository.findByEmail("contributor@ddu.ac.in").orElse(null);
                User admin = userRepository.findByEmail("admin@ddu.ac.in").orElse(null);
                Subject osSubject = subjectRepository.findByCodeIgnoreCase("CE401").orElse(null);

                if (contributor != null && osSubject != null) {
                    Paper samplePaper = Paper.builder()
                            .title("Operating Systems Sessional 1 Exam 2024")
                            .description("Official 1st Sessional examination question paper for CE Semester 4 including process scheduling and memory management.")
                            .resourceType(ResourceType.SESSIONAL_1)
                            .examYear(2024)
                            .subject(osSubject)
                            .uploader(contributor)
                            .status(ResourceStatus.APPROVED)
                            .reviewedBy(admin)
                            .reviewedAt(LocalDateTime.now())
                            .fileKey(sampleFileName)
                            .fileName("CE401_OS_Sessional1_2024.pdf")
                            .fileSizeBytes((long) Files.size(sampleFilePath))
                            .contentType("application/pdf")
                            .downloadCount(18L)
                            .viewCount(54L)
                            .build();

                    paperRepository.save(samplePaper);
                    log.info("Sample paper seeded.");
                }
            } catch (Exception ex) {
                log.warn("Could not seed sample paper file: {}", ex.getMessage());
            }
        }
    }
}
