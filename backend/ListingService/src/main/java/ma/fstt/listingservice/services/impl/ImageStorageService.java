package ma.fstt.listingservice.services.impl;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ImageStorageService {

    @Value("${app.upload.dir:uploads/properties}")
    private String uploadDir;

    /**
     * Stocke plusieurs images pour une propriété
     */
    public List<String> storeImages(String propertyId, List<MultipartFile> images) {
        List<String> imagePaths = new ArrayList<>();

        // Créer le dossier de la propriété s'il n'existe pas
        Path propertyDir = Paths.get(uploadDir, propertyId);
        try {
            Files.createDirectories(propertyDir);
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le dossier de stockage", e);
        }

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

            Path filePath = propertyDir.resolve(filename);

            try {
                Files.copy(image.getInputStream(), filePath);
                // Stocker le chemin relatif
                imagePaths.add(propertyId + "/" + filename);
            } catch (IOException e) {
                throw new RuntimeException("Échec du stockage de l'image: " + filename, e);
            }
        }

        return imagePaths;
    }

    /**
     * Stocke une seule image
     */
    public String storeImage(String propertyId, MultipartFile image) {
        List<MultipartFile> images = new ArrayList<>();
        images.add(image);
        List<String> paths = storeImages(propertyId, images);
        return paths.isEmpty() ? null : paths.get(0);
    }

    /**
     * Supprime une image du système de fichiers
     */
    public void deleteImage(String imagePath) {
        try {
            Path path = Paths.get(uploadDir, imagePath);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            throw new RuntimeException("Échec de la suppression de l'image: " + imagePath, e);
        }
    }

    /**
     * Supprime toutes les images d'une propriété
     */
    public void deleteAllPropertyImages(String propertyId) {
        try {
            Path propertyDir = Paths.get(uploadDir, propertyId);
            if (Files.exists(propertyDir)) {
                Files.walk(propertyDir)
                        .sorted((a, b) -> b.compareTo(a))
                        .forEach(path -> {
                            try {
                                Files.delete(path);
                            } catch (IOException e) {
                                // Log l'erreur mais continue
                                System.err.println("Impossible de supprimer: " + path);
                            }
                        });
            }
        } catch (IOException e) {
            throw new RuntimeException("Échec de la suppression du dossier: " + propertyId, e);
        }
    }

    /**
     * Récupère le chemin complet d'une image
     */
    public Path getImagePath(String imagePath) {
        return Paths.get(uploadDir, imagePath);
    }
}