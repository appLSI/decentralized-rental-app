pipeline {
    agent any

    tools {
        maven 'Maven3'
        nodejs 'Node18'
    }

    environment {
        GITHUB_TOKEN = credentials('github-token')
        
        RPC_URL = credentials('RPC_URL')
        PRIVATE_KEY = credentials('PRIVATE_KEY')
        PRIVATE_KEY_TENANT = credentials('PRIVATE_KEY_TENANT')

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

        stage('Compile Smart Contracts') {
    steps {
        dir('blockchain') {
            sh '''
                npm ci
                npx hardhat compile
            '''
        }
    }
}



        
        stage('Docker Build') {
            steps {
              sh """
              docker-compose build \
              --build-arg RPC_URL=$RPC_URL \
              --build-arg PRIVATE_KEY=$PRIVATE_KEY \
              --build-arg PRIVATE_KEY_TENANT=$PRIVATE_KEY_TENANT
              """
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
