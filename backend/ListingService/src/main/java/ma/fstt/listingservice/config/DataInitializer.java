package ma.fstt.listingservice.config;

import ma.fstt.listingservice.entities.Characteristic;
import ma.fstt.listingservice.entities.TypeCharacteristique;
import ma.fstt.listingservice.repositories.CharacteristicRepository;
import ma.fstt.listingservice.repositories.TypeCaracteristiqueRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

/**
 * ✅ Classe d'initialisation des données de base
 * S'exécute automatiquement au démarrage de l'application
 * Crée les Types de Caractéristiques et les Caractéristiques si elles n'existent pas
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private TypeCaracteristiqueRepository typeRepository;

    @Autowired
    private CharacteristicRepository characteristicRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        logger.info("🚀 Démarrage de l'initialisation des données...");

        // Vérifier si les données existent déjà
        long typeCount = typeRepository.count();
        long characteristicCount = characteristicRepository.count();

        if (typeCount > 0 && characteristicCount > 0) {
            logger.info("✅ Données déjà initialisées. TypeCharacteristiques: {}, Characteristics: {}",
                    typeCount, characteristicCount);
            return;
        }

        logger.info("📝 Initialisation des types de caractéristiques et caractéristiques...");

        try {
            // ========== ÉTAPE 1: Créer les Types de Caractéristiques ==========
            TypeCharacteristique typeEquipements = createTypeIfNotExists(
                    "Équipements",
                    "Équipements et installations disponibles dans la propriété",
                    "icon-equipements.svg"
            );

            TypeCharacteristique typeServices = createTypeIfNotExists(
                    "Services",
                    "Services fournis aux locataires",
                    "icon-services.svg"
            );

            TypeCharacteristique typeSecurite = createTypeIfNotExists(
                    "Sécurité",
                    "Éléments de sécurité et protection",
                    "icon-securite.svg"
            );

            TypeCharacteristique typeConfort = createTypeIfNotExists(
                    "Confort",
                    "Éléments de confort et commodités",
                    "icon-confort.svg"
            );

            TypeCharacteristique typeExterieur = createTypeIfNotExists(
                    "Extérieur",
                    "Aménagements extérieurs",
                    "icon-exterieur.svg"
            );

            logger.info("✅ Types de caractéristiques créés avec succès");

            // ========== ÉTAPE 2: Créer les Caractéristiques ==========

            // 🔹 ÉQUIPEMENTS
            createCharacteristicIfNotExists("WiFi", "wifi-icon.svg", typeEquipements);
            createCharacteristicIfNotExists("Télévision", "tv-icon.svg", typeEquipements);
            createCharacteristicIfNotExists("Cuisine", "kitchen-icon.svg", typeEquipements);
            createCharacteristicIfNotExists("Lave-linge", "washing-machine-icon.svg", typeEquipements);
            createCharacteristicIfNotExists("Sèche-linge", "dryer-icon.svg", typeEquipements);
            createCharacteristicIfNotExists("Lave-vaisselle", "dishwasher-icon.svg", typeEquipements);
            createCharacteristicIfNotExists("Climatisation", "ac-icon.svg", typeEquipements);
            createCharacteristicIfNotExists("Chauffage", "heating-icon.svg", typeEquipements);
            createCharacteristicIfNotExists("Fer à repasser", "iron-icon.svg", typeEquipements);
            createCharacteristicIfNotExists("Sèche-cheveux", "hairdryer-icon.svg", typeEquipements);

            // 🔹 SERVICES
            createCharacteristicIfNotExists("Parking gratuit", "parking-icon.svg", typeServices);
            createCharacteristicIfNotExists("Parking payant", "parking-paid-icon.svg", typeServices);
            createCharacteristicIfNotExists("Ménage inclus", "cleaning-icon.svg", typeServices);
            createCharacteristicIfNotExists("Service de conciergerie", "concierge-icon.svg", typeServices);
            createCharacteristicIfNotExists("Petit-déjeuner inclus", "breakfast-icon.svg", typeServices);
            createCharacteristicIfNotExists("Check-in automatique", "self-checkin-icon.svg", typeServices);
            createCharacteristicIfNotExists("Bagagerie disponible", "luggage-icon.svg", typeServices);

            // 🔹 SÉCURITÉ
            createCharacteristicIfNotExists("Détecteur de fumée", "smoke-detector-icon.svg", typeSecurite);
            createCharacteristicIfNotExists("Détecteur de monoxyde de carbone", "co-detector-icon.svg", typeSecurite);
            createCharacteristicIfNotExists("Extincteur", "fire-extinguisher-icon.svg", typeSecurite);
            createCharacteristicIfNotExists("Trousse de premiers secours", "first-aid-icon.svg", typeSecurite);
            createCharacteristicIfNotExists("Coffre-fort", "safe-icon.svg", typeSecurite);
            createCharacteristicIfNotExists("Caméras de sécurité", "security-camera-icon.svg", typeSecurite);
            createCharacteristicIfNotExists("Gardien", "guard-icon.svg", typeSecurite);

            // 🔹 CONFORT
            createCharacteristicIfNotExists("Draps et serviettes fournis", "linen-icon.svg", typeConfort);
            createCharacteristicIfNotExists("Produits de toilette", "toiletries-icon.svg", typeConfort);
            createCharacteristicIfNotExists("Espace de travail", "workspace-icon.svg", typeConfort);
            createCharacteristicIfNotExists("Cheminée", "fireplace-icon.svg", typeConfort);
            createCharacteristicIfNotExists("Baignoire", "bathtub-icon.svg", typeConfort);
            createCharacteristicIfNotExists("Douche à l'italienne", "walk-in-shower-icon.svg", typeConfort);
            createCharacteristicIfNotExists("Vue panoramique", "view-icon.svg", typeConfort);

            // 🔹 EXTÉRIEUR
            createCharacteristicIfNotExists("Piscine", "pool-icon.svg", typeExterieur);
            createCharacteristicIfNotExists("Jacuzzi", "jacuzzi-icon.svg", typeExterieur);
            createCharacteristicIfNotExists("Terrasse", "terrace-icon.svg", typeExterieur);
            createCharacteristicIfNotExists("Balcon", "balcony-icon.svg", typeExterieur);
            createCharacteristicIfNotExists("Jardin", "garden-icon.svg", typeExterieur);
            createCharacteristicIfNotExists("Barbecue", "bbq-icon.svg", typeExterieur);
            createCharacteristicIfNotExists("Salle de sport", "gym-icon.svg", typeExterieur);
            createCharacteristicIfNotExists("Vue sur mer", "sea-view-icon.svg", typeExterieur);
            createCharacteristicIfNotExists("Vue sur montagne", "mountain-view-icon.svg", typeExterieur);
            createCharacteristicIfNotExists("Accès plage privée", "private-beach-icon.svg", typeExterieur);

            logger.info("✅ Caractéristiques créées avec succès");

            // ========== ÉTAPE 3: Afficher le résumé ==========
            long finalTypeCount = typeRepository.count();
            long finalCharacteristicCount = characteristicRepository.count();

            logger.info("========================================");
            logger.info("✅ INITIALISATION TERMINÉE");
            logger.info("========================================");
            logger.info("📊 Types de caractéristiques: {}", finalTypeCount);
            logger.info("📊 Caractéristiques: {}", finalCharacteristicCount);
            logger.info("========================================");

        } catch (Exception e) {
            logger.error("❌ Erreur lors de l'initialisation des données: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Créer un Type de Caractéristique s'il n'existe pas déjà
     */
    private TypeCharacteristique createTypeIfNotExists(String name, String description, String iconPath) {
        return typeRepository.findByName(name)
                .orElseGet(() -> {
                    TypeCharacteristique type = new TypeCharacteristique();
                    type.setName(name);
                    type.setDescription(description);
                    type.setIconPath(iconPath);
                    TypeCharacteristique saved = typeRepository.save(type);
                    logger.info("✅ Type créé: {} (ID: {})", name, saved.getId());
                    return saved;
                });
    }

    /**
     * Créer une Caractéristique si elle n'existe pas déjà
     */
    private Characteristic createCharacteristicIfNotExists(String name, String iconPath, TypeCharacteristique type) {
        return characteristicRepository.findByName(name)
                .orElseGet(() -> {
                    Characteristic characteristic = new Characteristic();
                    characteristic.setName(name);
                    characteristic.setIconPath(iconPath);
                    characteristic.setActive(true);
                    characteristic.setTypeCaracteristique(type);
                    Characteristic saved = characteristicRepository.save(characteristic);
                    logger.debug("  → Caractéristique créée: {} (ID: {})", name, saved.getId());
                    return saved;
                });
    }
}