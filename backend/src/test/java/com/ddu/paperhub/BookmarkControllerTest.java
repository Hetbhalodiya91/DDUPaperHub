package com.ddu.paperhub;

import com.ddu.paperhub.dto.AuthRequest;
import com.ddu.paperhub.dto.AuthResponse;
import com.ddu.paperhub.entity.Paper;
import com.ddu.paperhub.repository.PaperRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("h2")
public class BookmarkControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PaperRepository paperRepository;

    private String studentToken;
    private Long samplePaperId;

    @BeforeEach
    void setUp() throws Exception {
        // Authenticate student
        AuthRequest loginRequest = new AuthRequest("student@ddu.ac.in", "Student@123");
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        studentToken = root.path("data").path("token").asText();

        Paper paper = paperRepository.findAll().stream().findFirst().orElse(null);
        if (paper != null) {
            samplePaperId = paper.getId();
        }
    }

    @Test
    @DisplayName("Should block unauthenticated user from bookmarks")
    void testUnauthenticatedBookmarkAccess() throws Exception {
        mockMvc.perform(get("/api/bookmarks"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should allow student to bookmark, query status, and retrieve bookmarks")
    void testBookmarkLifecycle() throws Exception {
        if (samplePaperId == null) return;

        // 1. Add Bookmark
        mockMvc.perform(post("/api/bookmarks/" + samplePaperId)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // 2. Check isBookmarked status
        mockMvc.perform(get("/api/bookmarks/" + samplePaperId + "/status")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(true));

        // 3. List bookmarks
        mockMvc.perform(get("/api/bookmarks")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].id").value(samplePaperId));

        // 4. Remove bookmark
        mockMvc.perform(delete("/api/bookmarks/" + samplePaperId)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // 5. Verify removed
        mockMvc.perform(get("/api/bookmarks/" + samplePaperId + "/status")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(false));
    }
}
