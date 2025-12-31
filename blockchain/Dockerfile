# ---------------------------------------------------------
#  Stage 1 — Build and compile smart contracts
# ---------------------------------------------------------
FROM node:22.20.0-alpine AS builder
# Using Node 22.20.0 as specified by the developer

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the project files
COPY . .



# ---------------------------------------------------------
# Stage 2 — Run Hardhat local blockchain node
# ---------------------------------------------------------
FROM node:22.20.0-alpine

WORKDIR /app

# Copy built app from builder stage
COPY --from=builder /app .

# Expose Hardhat network port (default)
EXPOSE 8545

# Default command — run local Hardhat node
CMD ["npx", "hardhat", "node"]
