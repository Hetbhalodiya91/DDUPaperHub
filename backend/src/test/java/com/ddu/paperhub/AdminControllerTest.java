package com.ddu.paperhub;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("h2")
public class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Should block unauthenticated user from admin dashboard")
    void testAdminUnauthenticatedBlocked() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "student@ddu.ac.in", authorities = {"ROLE_STUDENT"})
    @DisplayName("Should block student from accessing admin dashboard with 403 Forbidden")
    void testStudentForbiddenFromAdmin() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@ddu.ac.in", authorities = {"ROLE_ADMIN"})
    @DisplayName("Should permit admin user to view dashboard and review queue")
    void testAdminPermitted() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.paperStats").exists());
    }
}
