package ma.fstt.paymentservice.domain;

/**
 * Statuts possibles d'un paiement blockchain
 *
 * Workflow normal:
 * PENDING → VALIDATING → CONFIRMED
 *
 * En cas d'erreur:
 * PENDING/VALIDATING → FAILED
 *
 * En cas d'annulation:
 * CONFIRMED → CANCELLED (détecté via événement blockchain)
 */
public enum PaymentStatus {

    /**
     * En attente de validation
     * Transaction soumise mais pas encore validée
     */
    PENDING,

    /**
     * Validation en cours
     * Le service est en train de vérifier la transaction blockchain
     */
    VALIDATING,

    /**
     * Confirmé
     * fund() appelé avec succès, événement Funded émis
     * État du contrat = Funded
     */
    CONFIRMED,

    /**
     * Échec de validation
     * Transaction non trouvée, montant incorrect, ou autre erreur
     */
    FAILED,

    /**
     * Annulé
     * Contrat annulé (événement Cancelled détecté)
     */
    CANCELLED
}