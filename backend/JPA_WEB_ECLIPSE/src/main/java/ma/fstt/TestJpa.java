package ma.fstt;

import jakarta.persistence.*;
import ma.fstt.model.Personne;


public class TestJpa {
    public static void main(String[] args) {
        EntityManagerFactory emf = Persistence.createEntityManagerFactory("default");
        EntityManager em = emf.createEntityManager();

        em.getTransaction().begin();

        Personne u = new Personne();
        u.setName("Alice");
        em.persist(u);

        em.getTransaction().commit();
        em.close();
        emf.close();

        System.out.println("✅ Connexion réussie et utilisateur ajouté !");
    }
}
