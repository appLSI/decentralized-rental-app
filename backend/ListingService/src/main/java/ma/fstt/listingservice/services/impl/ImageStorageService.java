package ma.fstt.listingservice.services.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ImageStorageService {

    private final S3Service s3Service;

    /**
     * Stocke plusieurs images pour une propriété sur S3
     */
    public List<String> storeImages(String propertyId, List<MultipartFile> images) {
        return s3Service.storePropertyImages(propertyId, images);
    }

    /**
     * Stocke une seule image sur S3
     */
    public String storeImage(String propertyId, MultipartFile image) {
        List<MultipartFile> images = new ArrayList<>();
        images.add(image);
        List<String> urls = storeImages(propertyId, images);
        return urls.isEmpty() ? null : urls.get(0);
    }

    /**
     * Supprime une image de S3
     */
    public void deleteImage(String imageUrl) {
        s3Service.deleteFile(imageUrl);
    }

    /**
     * Supprime toutes les images d'une propriété de S3
     */
    public void deleteAllPropertyImages(String propertyId) {
        s3Service.deleteAllPropertyImages(propertyId);
    }
}