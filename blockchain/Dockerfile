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

ARG RPC_URL
ARG PRIVATE_KEY
ARG PRIVATE_KEY_TENANT

ENV RPC_URL=${RPC_URL}
ENV PRIVATE_KEY=${PRIVATE_KEY}
ENV PRIVATE_KEY_TENANT=${PRIVATE_KEY_TENANT}

# Compile smart contracts with Hardhat 2.26.3 (Solidity 0.8.28)
RUN npx hardhat compile


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
