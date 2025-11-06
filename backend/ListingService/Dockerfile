# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app

# Définir l'encodage UTF-8
ENV MAVEN_OPTS="-Dfile.encoding=UTF-8"

COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -Dproject.build.sourceEncoding=UTF-8

# Stage 2: Run
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

# Créer le répertoire pour les uploads
RUN mkdir -p /app/uploads/properties

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]