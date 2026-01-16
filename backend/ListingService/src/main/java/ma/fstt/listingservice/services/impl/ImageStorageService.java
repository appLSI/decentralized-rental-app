package ma.fstt.listingservice.services.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Object;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageStorageService {

    private final S3Client s3Client;

    // ✅ CRITICAL FIX: Changed from "aws.s3.bucket" to "aws.s3.bucket-name"
    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.region}")
    private String region;

    /**
     * Upload des images sur S3
     * Retourne l'URL complete (ex: https://mon-bucket.s3.amazonaws.com/prop-123/image.jpg)
     */
    public List<String> storeImages(String propertyId, List<MultipartFile> images) {
        List<String> imageUrls = new ArrayList<>();

        for (MultipartFile image : images) {
            if (image.isEmpty()) continue;

            // 1. Generer un nom unique : propertyId/uuid.jpg
            String filename = UUID.randomUUID().toString() + getExtension(image.getOriginalFilename());
            String key = propertyId + "/" + filename;

            try {
                // 2. Upload vers S3
                PutObjectRequest putOb = PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .contentType(image.getContentType())
                        // .acl(ObjectCannedACL.PUBLIC_READ) // Decommenter si le bucket n'est pas public par defaut
                        .build();

                s3Client.putObject(putOb, RequestBody.fromInputStream(image.getInputStream(), image.getSize()));

                // 3. Construire l'URL publique
                // Format: https://{bucket}.s3.{region}.amazonaws.com/{key}
                String fileUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, key);
                imageUrls.add(fileUrl);

                log.info("✅ Image uploaded to S3: {}", fileUrl);

            } catch (IOException e) {
                log.error("❌ Failed to upload image to S3", e);
                throw new RuntimeException("Failed to upload image to S3", e);
            }
        }
        return imageUrls;
    }

    /**
     * Supprime une image S3 via son URL ou sa cle
     */
    public void deleteImage(String imageUrl) {
        String key = extractKeyFromUrl(imageUrl);
        try {
            DeleteObjectRequest deleteReq = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();
            s3Client.deleteObject(deleteReq);
            log.info("🗑️ Deleted image from S3: {}", key);
        } catch (Exception e) {
            log.error("❌ Error deleting image from S3: {}", imageUrl, e);
        }
    }

    /**
     * Supprime toutes les images d'une propriete (Dossier S3)
     */
    public void deleteAllPropertyImages(String propertyId) {
        // S3 n'a pas de vrais "dossiers", on liste tous les objets qui commencent par "propertyId/"
        try {
            ListObjectsV2Request listReq = ListObjectsV2Request.builder()
                    .bucket(bucketName)
                    .prefix(propertyId + "/")
                    .build();

            ListObjectsV2Response listRes = s3Client.listObjectsV2(listReq);

            for (S3Object s3Object : listRes.contents()) {
                DeleteObjectRequest deleteReq = DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(s3Object.key())
                        .build();
                s3Client.deleteObject(deleteReq);
            }
            log.info("🗑️ Deleted all images for property: {}", propertyId);

        } catch (Exception e) {
            log.error("❌ Error cleaning property folder on S3: {}", propertyId, e);
        }
    }

    // --- Utilitaires ---

    private String getExtension(String filename) {
        return filename != null && filename.contains(".")
                ? filename.substring(filename.lastIndexOf("."))
                .toLowerCase() : ".jpg";
    }

    private String extractKeyFromUrl(String url) {
        // Si l'URL est complete, on extrait juste la cle (partie apres le domaine)
        // Ex: https://bucket...com/prop-1/img.jpg -> prop-1/img.jpg
        if (url.contains(".amazonaws.com/")) {
            return url.substring(url.indexOf(".amazonaws.com/") + 15);
        }
        return url; // C'est deja une cle
    }
}