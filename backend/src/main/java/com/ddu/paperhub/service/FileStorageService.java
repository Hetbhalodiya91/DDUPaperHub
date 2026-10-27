package com.ddu.paperhub.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    /**
     * Stores a file and returns a unique file key.
     */
    String storeFile(MultipartFile file);

    /**
     * Stores raw bytes (e.g. generated thumbnails) and returns a unique file key.
     */
    String storeBytes(byte[] bytes, String fileName, String contentType);

    /**
     * Loads a file as a Spring Resource for streaming / downloading.
     */
    Resource loadFileAsResource(String fileKey);

    /**
     * Deletes a file by its key.
     */
    void deleteFile(String fileKey);

    /**
     * Generates a direct preview / download URL if supported, or null for backend proxy streaming.
     */
    String getDirectAccessUrl(String fileKey);
}
