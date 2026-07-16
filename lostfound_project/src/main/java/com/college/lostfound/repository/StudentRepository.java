package com.college.lostfound.repository;

import com.college.lostfound.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByEmail(String email);
    Optional<Student> findByStudentNumber(String studentNumber);
    boolean existsByEmail(String email);
    boolean existsByStudentNumber(String studentNumber);
}
