package com.example.authmicro_service1.services.impl;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Envoie un code OTP de vérification par email
     * @param to Email du destinataire
     * @param code Code OTP à 6 chiffres
     */
    public void sendVerificationCode(String to, String code) {
        String subject = "Code de vérification - Votre compte";

        String message = "Bonjour,\n\n" +
                "Merci de vous être inscrit ! Voici votre code de vérification :\n\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                "   CODE : " + code + "\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                "Ce code est valide pendant 15 minutes.\n\n" +
                "Si vous n'avez pas demandé ce code, veuillez ignorer cet email.\n\n" +
                "Cordialement,\n" +
                "L'équipe";

        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(to);
        email.setSubject(subject);
        email.setText(message);

        mailSender.send(email);
    }

    /**
     * Envoie un code OTP pour la réinitialisation du mot de passe
     */




    public void sendPasswordResetCode(String to, String code) {
        String subject = "Réinitialisation de mot de passe";

        String message = "Bonjour,\n\n" +
                "Vous avez demandé à réinitialiser votre mot de passe.\n\n" +
                "Voici votre code de vérification :\n\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                "   CODE : " + code + "\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                "Ce code est valide pendant 15 minutes.\n\n" +
                "Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.\n\n" +
                "Cordialement,\n" +
                "L'équipe";

        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(to);
        email.setSubject(subject);
        email.setText(message);

        mailSender.send(email);
    }
}