package com.ddu.paperhub.controller;

import com.ddu.paperhub.dto.ApiResponse;
import com.ddu.paperhub.dto.PaperResponse;
import com.ddu.paperhub.entity.Bookmark;
import com.ddu.paperhub.entity.Paper;
import com.ddu.paperhub.entity.User;
import com.ddu.paperhub.exception.ResourceNotFoundException;
import com.ddu.paperhub.repository.BookmarkRepository;
import com.ddu.paperhub.repository.PaperRepository;
import com.ddu.paperhub.repository.UserRepository;
import com.ddu.paperhub.security.UserDetailsImpl;
import com.ddu.paperhub.service.PaperService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
public class BookmarkController {

    private final BookmarkRepository bookmarkRepository;
    private final PaperRepository paperRepository;
    private final UserRepository userRepository;
    private final PaperService paperService;

    /**
     * Add a bookmark for the authenticated user.
     */
    @PostMapping("/{paperId}")
    public ResponseEntity<ApiResponse<String>> addBookmark(
            @PathVariable Long paperId,
            Authentication authentication) {

        User user = getCurrentUser(authentication);
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new ResourceNotFoundException("Paper not found with id: " + paperId));

        if (!bookmarkRepository.existsByUserAndPaper(user, paper)) {
            Bookmark bookmark = Bookmark.builder()
                    .user(user)
                    .paper(paper)
                    .build();
            bookmarkRepository.save(bookmark);
        }

        return ResponseEntity.ok(ApiResponse.success("Paper bookmarked successfully"));
    }

    /**
     * Remove a bookmark for the authenticated user.
     */
    @DeleteMapping("/{paperId}")
    public ResponseEntity<ApiResponse<String>> removeBookmark(
            @PathVariable Long paperId,
            Authentication authentication) {

        User user = getCurrentUser(authentication);
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new ResourceNotFoundException("Paper not found with id: " + paperId));

        bookmarkRepository.findByUserAndPaper(user, paper)
                .ifPresent(bookmarkRepository::delete);

        return ResponseEntity.ok(ApiResponse.success("Bookmark removed"));
    }

    /**
     * Get all bookmarked papers for the authenticated user.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PaperResponse>>> getMyBookmarks(Authentication authentication) {
        User user = getCurrentUser(authentication);
        List<Bookmark> bookmarks = bookmarkRepository.findByUserOrderByCreatedAtDesc(user);

        List<PaperResponse> papers = bookmarks.stream()
                .map(b -> paperService.mapToResponse(b.getPaper()))
                .toList();

        return ResponseEntity.ok(ApiResponse.success("Bookmarks retrieved", papers));
    }

    /**
     * Check if a specific paper is bookmarked by the authenticated user.
     */
    @GetMapping("/{paperId}/status")
    public ResponseEntity<ApiResponse<Boolean>> isBookmarked(
            @PathVariable Long paperId,
            Authentication authentication) {

        User user = getCurrentUser(authentication);
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new ResourceNotFoundException("Paper not found with id: " + paperId));

        boolean exists = bookmarkRepository.existsByUserAndPaper(user, paper);
        return ResponseEntity.ok(ApiResponse.success("Bookmark status retrieved", exists));
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private User getCurrentUser(Authentication authentication) {
        UserDetailsImpl principal = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
