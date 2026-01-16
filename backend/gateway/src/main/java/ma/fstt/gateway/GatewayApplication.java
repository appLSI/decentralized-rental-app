package ma.fstt.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;



@SpringBootApplication
public class GatewayApplication {

	public static void main(String[] args) {
		SpringApplication.run(GatewayApplication.class, args);
		System.out.println("✅ API Gateway démarré avec succès sur le port 8082");
		System.out.println("🔐 Vérification JWT activée pour toutes les routes protégées");
	}
}
