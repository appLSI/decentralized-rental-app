package ma.fstt.bookingservice.listener;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class DeadLetterQueueListener {

    /**
     * ✅ Écoute la Dead Letter Queue pour logger les échecs
     */
    @RabbitListener(queues = "rental.dlq")
    public void handleDeadLetter(JsonNode message) {
        log.error("💀 Dead letter received: {}", message.toString());

        // TODO: Envoyer alerte email/Slack
        // TODO: Sauvegarder dans une table 'failed_events' pour retry manuel
    }
}