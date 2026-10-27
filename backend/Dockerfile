# Stage 1: Build JAR using Maven
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and package application
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime image
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create upload directory
RUN mkdir -p /app/uploads

# Copy executable jar from build stage
COPY --from=build /app/target/paperhub-backend-1.0.0.jar app.jar

ENV SERVER_PORT=8081
ENV STORAGE_TYPE=local
ENV LOCAL_UPLOAD_DIR=/app/uploads

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
