package com.ddu.paperhub.repository;

import com.ddu.paperhub.entity.Bookmark;
import com.ddu.paperhub.entity.Paper;
import com.ddu.paperhub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    boolean existsByUserAndPaper(User user, Paper paper);

    Optional<Bookmark> findByUserAndPaper(User user, Paper paper);

    List<Bookmark> findByUserOrderByCreatedAtDesc(User user);

    void deleteByUserAndPaper(User user, Paper paper);
}
