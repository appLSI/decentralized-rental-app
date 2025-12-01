package ma.fstt.listingservice.services.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Service {

    @Value("${aws.bucketName}")
    private String bucketName;

    @Value("${aws.region}")
    private String regionName;

    private final S3Client s3Client;

    @Value("${aws.properties.folder:properties/}")
    private String propertiesFolder;

    @Value("${aws.user.profile.folder:profile-pictures/}")
    private String profileFolder;

    public String storeFile(MultipartFile file) {
        String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();
        return storeFile(file, fileName);
    }

    public String storeFile(MultipartFile file, String fileName) {
        String key = profileFolder + fileName;
        return uploadToS3(file, key);
    }

    public List<String> storePropertyImages(String propertyId, List<MultipartFile> images) {
        List<String> imageUrls = new ArrayList<>();

        for (MultipartFile image : images) {
            if (image.isEmpty()) {
                continue;
            }

            // Valider le type de fichier
            String contentType = image.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new RuntimeException("Le fichier doit être une image");
            }

            // Générer un nom de fichier unique
            String originalFilename = image.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";
            String filename = UUID.randomUUID().toString() + extension;

            // Construire la clé S3 avec le dossier de la propriété
            String key = propertiesFolder + propertyId + "/" + filename;

            String url = uploadToS3(image, key);
            imageUrls.add(url);
        }

        return imageUrls;
    }

    public void deleteFile(String url) {
        try {
            String key = extractKeyFromUrl(url);

            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);

        } catch (S3Exception e) {
            System.err.println("Failed to delete file from S3: " + e.awsErrorDetails().errorMessage());
            throw e;
        }
    }

    public void deleteAllPropertyImages(String propertyId) {
        try {
            String prefix = propertiesFolder + propertyId + "/";

            // Lister tous les objets avec ce préfixe
            ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
                    .bucket(bucketName)
                    .prefix(prefix)
                    .build();

            ListObjectsV2Response listResponse = s3Client.listObjectsV2(listRequest);

            // Supprimer chaque objet
            for (S3Object s3Object : listResponse.contents()) {
                DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(s3Object.key())
                        .build();

                s3Client.deleteObject(deleteRequest);
            }

        } catch (S3Exception e) {
            System.err.println("Failed to delete property images from S3: " + e.awsErrorDetails().errorMessage());
            throw new RuntimeException("Échec de la suppression des images de la propriété: " + propertyId, e);
        }
    }

    /**
     * Méthode privée pour uploader un fichier vers S3
     */
    private String uploadToS3(MultipartFile file, String key) {
        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.getContentType())
                .build();

        try {
            s3Client.putObject(request, RequestBody.fromBytes(file.getBytes()));
        } catch (IOException e) {
            throw new RuntimeException("Échec du téléchargement vers S3: " + key, e);
        }

        return "https://" + bucketName + ".s3." + regionName + ".amazonaws.com/" + key;
    }

    /**
     * Extrait la clé S3 depuis une URL
     */
    private String extractKeyFromUrl(String url) {
        try {
            java.net.URI uri = new java.net.URI(url);
            String path = uri.getPath();
            if (path.startsWith("/")) {
                path = path.substring(1);
            }
            return path;
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid S3 URL: " + url, e);
        }
    }
}