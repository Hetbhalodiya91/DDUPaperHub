package com.ddu.paperhub.config;

import com.ddu.paperhub.service.FileStorageService;
import com.ddu.paperhub.service.impl.LocalFileStorageService;
import com.ddu.paperhub.service.impl.S3FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StorageConfig {

    @Bean
    @ConditionalOnProperty(name = "storage.type", havingValue = "s3")
    public FileStorageService s3FileStorageService(
            @Value("${storage.s3.bucket-name}") String bucketName,
            @Value("${storage.s3.region:us-east-1}") String region,
            @Value("${storage.s3.endpoint:}") String endpoint,
            @Value("${storage.s3.access-key:}") String accessKey,
            @Value("${storage.s3.secret-key:}") String secretKey
    ) {
        return new S3FileStorageService(bucketName, region, endpoint, accessKey, secretKey);
    }

    @Bean
    @ConditionalOnProperty(name = "storage.type", havingValue = "local", matchIfMissing = true)
    public FileStorageService localFileStorageService(
            @Value("${storage.local.upload-dir:./uploads}") String uploadDir
    ) {
        return new LocalFileStorageService(uploadDir);
    }
}
