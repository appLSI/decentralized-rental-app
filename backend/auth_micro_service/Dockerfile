# Étape 1 : Build du projet
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app

# Copie du pom.xml et téléchargement des dépendances
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copie du code source
COPY src ./src

# Compilation du projet
RUN mvn clean package -DskipTests

# Étape 2 : Image finale pour exécution
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
