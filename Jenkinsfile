pipeline {
    agent any

    tools {
        maven 'Maven3'
        nodejs 'Node18'
    }

    environment {
        GITHUB_TOKEN = credentials('github-token')
    }

    triggers {
        githubPush()
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'dev', url: 'https://github.com/appLSI/decentralized-rental-app'
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend/auth_micro_service') {
                    sh 'mvn clean package -DskipTests'
                    sh 'mvn clean package -DskipTests -Dproject.build.sourceEncoding=UTF-8'
                }
            }
        }
        /*stage('Test Backend') {
        environment { 
            SPRING_PROFILES_ACTIVE = 'test' 
        }
        steps { 
            dir('backend/auth_micro_service') { 
                sh 'mvn test' 
                
            } 
            
        } 
        post { 
            always { 
                junit 'backend/auth_micro_service/target/surefire-reports/*.xml' 
                }
            }
        }
        */

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh '''
                        npm ci
                        npm run build
                    '''
                }
            }
        }
        stage('Test Smart Contracts') {
            steps {
                withCredentials([
                    string(credentialsId: 'RPC_URL', variable: 'RPC_URL'),
                    string(credentialsId: 'PRIVATE_KEY', variable: 'PRIVATE_KEY'),
                    string(credentialsId: 'PRIVATE_KEY_TENANT', variable: 'PRIVATE_KEY_TENANT')
                ]) {
                    dir('blockchain') {
                        sh '''
                        # create temporary .env for this build
                        echo "SEPOLIA_RPC_URL=$RPC_URL" > .env
                        echo "PRIVATE_KEY_OWNER=$PRIVATE_KEY" >> .env
                        echo "PRIVATE_KEY_TENANT=$PRIVATE_KEY_TENANT" >> .env
                        # install dependencies
                        npm install
                        # run smart contract tests
                        npx hardhat test 
                        '''
                    }
                }
            }
        }
        
        stage('Docker Build') {
            steps {
                sh 'docker-compose build'
            }
        }

        // 🔥 NEW STAGE YOU NEED (push to Docker Hub)
        stage('Docker Build & Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'dockerhub-credentials') {
                        
                        // Auth microservice
                        def authImage = docker.build("noha552/auth_micro_service:${env.BUILD_NUMBER}", "backend/auth_micro_service")
                        authImage.push()

                        // Listing service (add directory if exists)
                        def listingImage = docker.build("noha552/listing-service:${env.BUILD_NUMBER}", "backend/listing_service")
                        listingImage.push()

                        // Gateway
                        def gatewayImage = docker.build("noha552/gateway:${env.BUILD_NUMBER}", "backend/gateway")
                        gatewayImage.push()

                        // Frontend
                        def frontendImage = docker.build("noha552/frontend:${env.BUILD_NUMBER}", "frontend")
                        frontendImage.push()

                        // Blockchain
                        def blockchainImage = docker.build("noha552/blockchain:${env.BUILD_NUMBER}", "blockchain")
                        blockchainImage.push()
                    }
                }
            }
        }

        stage('Archive Artifacts') {
            steps {
                archiveArtifacts artifacts: '**/target/*.jar', fingerprint: true
            }
        }
    }

    post {
        success {
            echo "Intégration continue réussie pour Decentralized Rental App."
        }
        failure {
            echo "Échec, vérifie les logs Jenkins."
        }
    }
}
