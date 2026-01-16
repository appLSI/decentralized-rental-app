# ==================== STAGE 1: BUILD ====================
FROM maven:3.9.5-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Copier les fichiers de configuration Maven
COPY pom.xml .

# Télécharger les dépendances (cache Docker layer)
RUN mvn dependency:go-offline -B

# Copier le code source
COPY src ./src

# Build du projet (skip tests pour accélérer)
RUN mvn clean package -DskipTests

# ==================== STAGE 2: RUNTIME ====================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -S spring && adduser -S spring -G spring

# Copier le JAR depuis le stage builder
COPY --from=builder /app/target/payment-service-*.jar app.jar

# Créer le dossier logs
RUN mkdir -p logs && chown -R spring:spring /app

# Passer à l'utilisateur non-root
USER spring:spring

# Exposer le port du service
EXPOSE 8084

# Health check (vérifie que le service répond)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8084/api/v1/actuator/health || exit 1

# Variables d'environnement par défaut (overridées par docker-compose)
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Lancer l'application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]