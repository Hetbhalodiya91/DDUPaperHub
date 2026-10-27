package com.ddu.paperhub;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("h2")
public class PaperControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Should retrieve approved papers publicly without authentication")
    void testSearchPapersPublic() throws Exception {
        mockMvc.perform(get("/api/papers/search"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    @DisplayName("Should retrieve departments publicly")
    void testGetDepartments() throws Exception {
        mockMvc.perform(get("/api/departments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].code").isNotEmpty());
    }

    @Test
    @DisplayName("Should block unauthenticated user from paper upload endpoint")
    void testUploadUnauthenticatedBlocked() throws Exception {
        mockMvc.perform(post("/api/papers/upload"))
                .andExpect(status().isUnauthorized());
    }
}
