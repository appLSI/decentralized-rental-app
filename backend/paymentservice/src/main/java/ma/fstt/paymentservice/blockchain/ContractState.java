package ma.fstt.paymentservice.blockchain;

/**
 * États possibles du contrat RentalEscrow
 * DOIT correspondre EXACTEMENT à l'enum Solidity
 *
 * enum State { Created, Funded, Active, Completed, Cancelled }
 */
public enum ContractState {

    /**
     * État 0: Contrat créé mais pas encore payé
     */
    Created,

    /**
     * État 1: fund() appelé avec succès
     * C'est l'état que nous validons dans PaymentService
     */
    Funded,

    /**
     * État 2: startLease() appelé par le owner
     * La location a démarré
     */
    Active,

    /**
     * État 3: complete() appelé par le owner
     * Les fonds ont été transférés
     */
    Completed,

    /**
     * État 4: cancel() appelé
     * Contrat annulé, remboursement effectué selon les règles
     */
    Cancelled;

    /**
     * Convertit l'index Solidity en enum Java
     *
     * @param index Index retourné par le contrat (0-4)
     * @return ContractState correspondant
     * @throws IllegalArgumentException si index invalide
     */
    public static ContractState fromIndex(int index) {
        if (index < 0 || index >= values().length) {
            throw new IllegalArgumentException(
                    String.format("Invalid contract state index: %d. Must be between 0 and %d",
                            index, values().length - 1)
            );
        }
        return values()[index];
    }
}