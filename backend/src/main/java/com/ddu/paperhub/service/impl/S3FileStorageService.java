package com.ddu.paperhub.service.impl;

import com.ddu.paperhub.exception.FileStorageException;
import com.ddu.paperhub.exception.ResourceNotFoundException;
import com.ddu.paperhub.service.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.net.URI;
import java.util.UUID;

@Slf4j
public class S3FileStorageService implements FileStorageService {

    private final S3Client s3Client;
    private final String bucketName;

    public S3FileStorageService(
            @Value("${storage.s3.bucket-name}") String bucketName,
            @Value("${storage.s3.region:us-east-1}") String regionName,
            @Value("${storage.s3.endpoint:}") String endpoint,
            @Value("${storage.s3.access-key:}") String accessKey,
            @Value("${storage.s3.secret-key:}") String secretKey
    ) {
        this.bucketName = bucketName;

        S3ClientBuilder builder = S3Client.builder();

        if (regionName != null && !regionName.equalsIgnoreCase("auto") && !regionName.isBlank()) {
            builder.region(Region.of(regionName));
        } else {
            builder.region(Region.US_EAST_1);
        }

        if (StringUtils.hasText(endpoint)) {
            builder.endpointOverride(URI.create(endpoint));
        }

        if (StringUtils.hasText(accessKey) && StringUtils.hasText(secretKey)) {
            builder.credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKey, secretKey)
            ));
        }

        this.s3Client = builder.build();
        log.info("Initialized S3/R2 storage service with bucket: {}", bucketName);
    }

    @Override
    public String storeFile(MultipartFile file) {
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.pdf");
        String extension = "";
        int extIndex = originalFileName.lastIndexOf(".");
        if (extIndex > 0) {
            extension = originalFileName.substring(extIndex);
        }

        String key = "papers/" + UUID.randomUUID() + extension;

        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(this.bucketName)
                    .key(key)
                    .contentType(file.getContentType() != null ? file.getContentType() : "application/pdf")
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            log.info("Uploaded file to S3/R2: key={}", key);
            return key;
        } catch (IOException | S3Exception ex) {
            throw new FileStorageException("Failed to upload file to object storage: " + originalFileName, ex);
        }
    }

    @Override
    public String storeBytes(byte[] bytes, String fileName, String contentType) {
        String key = "thumbnails/" + UUID.randomUUID() + ".jpg";
        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(this.bucketName)
                    .key(key)
                    .contentType(contentType != null ? contentType : "image/jpeg")
                    .contentLength((long) bytes.length)
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromBytes(bytes));
            return key;
        } catch (S3Exception ex) {
            log.warn("Failed to upload thumbnail to S3/R2: {}", ex.getMessage());
            return null;
        }
    }

    @Override
    public Resource loadFileAsResource(String fileKey) {
        try {
            GetObjectRequest getRequest = GetObjectRequest.builder()
                    .bucket(this.bucketName)
                    .key(fileKey)
                    .build();

            ResponseBytes<GetObjectResponse> objectBytes = s3Client.getObjectAsBytes(getRequest);
            return new ByteArrayResource(objectBytes.asByteArray());
        } catch (NoSuchKeyException ex) {
            throw new ResourceNotFoundException("File not found in S3/R2: " + fileKey);
        } catch (S3Exception ex) {
            throw new FileStorageException("Error reading file from S3/R2: " + fileKey, ex);
        }
    }

    @Override
    public void deleteFile(String fileKey) {
        try {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(this.bucketName)
                    .key(fileKey)
                    .build();
            s3Client.deleteObject(deleteRequest);
            log.info("Deleted object from S3/R2: key={}", fileKey);
        } catch (S3Exception ex) {
            log.warn("Failed to delete object from S3/R2: key={}", fileKey, ex);
        }
    }

    @Override
    public String getDirectAccessUrl(String fileKey) {
        // Can be extended with S3Presigner for presigned URLs
        return null;
    }
}
