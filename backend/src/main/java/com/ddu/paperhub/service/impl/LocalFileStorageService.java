package com.ddu.paperhub.service.impl;

import com.ddu.paperhub.exception.FileStorageException;
import com.ddu.paperhub.exception.ResourceNotFoundException;
import com.ddu.paperhub.service.FileStorageService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Slf4j
public class LocalFileStorageService implements FileStorageService {

    private final Path fileStorageLocation;

    public LocalFileStorageService(@Value("${storage.local.upload-dir:./uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
            log.info("Local file storage initialized at: {}", this.fileStorageLocation);
        } catch (Exception ex) {
            throw new FileStorageException("Could not create the directory for file uploads.", ex);
        }
    }

    @Override
    public String storeFile(MultipartFile file) {
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.pdf");

        try {
            if (originalFileName.contains("..")) {
                throw new FileStorageException("Filename contains invalid path sequence: " + originalFileName);
            }

            String fileExtension = "";
            int extIndex = originalFileName.lastIndexOf(".");
            if (extIndex > 0) {
                fileExtension = originalFileName.substring(extIndex);
            }

            String storedFileName = UUID.randomUUID().toString() + fileExtension;
            Path targetLocation = this.fileStorageLocation.resolve(storedFileName);

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }

            log.info("Stored file locally: {}", storedFileName);
            return storedFileName;
        } catch (IOException ex) {
            throw new FileStorageException("Failed to store file " + originalFileName, ex);
        }
    }

    @Override
    public String storeBytes(byte[] bytes, String fileName, String contentType) {
        try {
            String extension = ".jpg";
            int extIndex = fileName.lastIndexOf(".");
            if (extIndex > 0) {
                extension = fileName.substring(extIndex);
            }

            String storedFileName = "thumb-" + UUID.randomUUID() + extension;
            Path targetLocation = this.fileStorageLocation.resolve(storedFileName);
            Files.write(targetLocation, bytes);
            return storedFileName;
        } catch (IOException ex) {
            log.warn("Failed to store bytes: {}", ex.getMessage());
            return null;
        }
    }

    @Override
    public Resource loadFileAsResource(String fileKey) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileKey).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found on server: " + fileKey);
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File not found on server: " + fileKey);
        }
    }

    @Override
    public void deleteFile(String fileKey) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileKey).normalize();
            Files.deleteIfExists(filePath);
            log.info("Deleted local file: {}", fileKey);
        } catch (IOException ex) {
            log.warn("Could not delete local file: {}", fileKey, ex);
        }
    }

    @Override
    public String getDirectAccessUrl(String fileKey) {
        // Local files are served through backend controller endpoints
        return null;
    }
}
