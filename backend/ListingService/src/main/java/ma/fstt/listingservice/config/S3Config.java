package ma.fstt.listingservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

import java.net.URI;

@Configuration
public class S3Config {

    // ✅ CRITICAL FIX: Changed from "aws.access.key" to "aws.s3.access-key"
    @Value("${aws.s3.access-key}")
    private String accessKey;

    // ✅ CRITICAL FIX: Changed from "aws.secret.key" to "aws.s3.secret-key"
    @Value("${aws.s3.secret-key}")
    private String secretKey;

    @Value("${aws.s3.region}")
    private String region;

    @Bean
    public S3Client s3Client() {
        try {
            AwsBasicCredentials awsCreds = AwsBasicCredentials.create(accessKey, secretKey);

            // ✅ CRITICAL FIX: Explicit endpoint URI to avoid DNS resolution issues in Docker
            String endpoint = String.format("https://s3.%s.amazonaws.com", region);

            System.out.println("=".repeat(60));
            System.out.println("🔧 Initializing AWS S3 Client...");
            System.out.println("📍 Region: " + region);
            System.out.println("🪣 Endpoint: " + endpoint);
            System.out.println("🔑 Access Key: " + (accessKey != null ? accessKey.substring(0, Math.min(10, accessKey.length())) + "..." : "NULL"));
            System.out.println("=".repeat(60));

            S3Client client = S3Client.builder()
                    .region(Region.of(region))
                    .credentialsProvider(StaticCredentialsProvider.create(awsCreds))
                    // ✅ CRITICAL: Use path-style access for better Docker compatibility
                    .serviceConfiguration(S3Configuration.builder()
                            .pathStyleAccessEnabled(true)
                            .build())
                    // ✅ CRITICAL: Force explicit endpoint to bypass DNS issues
                    .endpointOverride(URI.create(endpoint))
                    .build();

            System.out.println("✅ S3Client created successfully!");
            System.out.println("=".repeat(60));

            return client;

        } catch (Exception e) {
            System.err.println("❌ CRITICAL ERROR: Failed to create S3Client");
            System.err.println("📋 Error message: " + e.getMessage());
            System.err.println("🔍 Error type: " + e.getClass().getName());
            e.printStackTrace();
            throw new RuntimeException("Failed to initialize S3 client", e);
        }
    }
}