package com.example.authmicro_service1.services.impl;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Envoie un code OTP de vérification par email
     */
    public void sendOTPEmail(String to, String code) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("Daar.Chain@gmail.com");
            helper.setTo(to);
            helper.setSubject("Code de vérification - Votre compte");

            String htmlContent = String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                    <h2 style="color: #4CAF50; text-align: center;">Code de Vérification</h2>
                    <p style="text-align: center;">Bonjour,</p>
                    <p style="text-align: center;">Merci de vous être inscrit ! Voici votre code de vérification :</p>
                    
                    <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; border: 1px solid #4CAF50;">
                        <h3 style="margin: 0; color: #333;">CODE : %s</h3>
                    </div>
                    
                    <p style="text-align: center; color: #ff5722;"><strong>⚠️ Ce code est valide pendant 15 minutes.</strong></p>
                    
                    <p style="text-align: center;">Si vous n'avez pas demandé ce code, veuillez ignorer cet email.</p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
                        <p style="font-size: 12px; color: #666;">
                            Cordialement,<br>L'équipe
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """, code);

            helper.setText(htmlContent, true);
            mailSender.send(message);

            System.out.println("✅ Email OTP envoyé à: " + to);
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de l'envoi de l'email OTP: " + e.getMessage());
            throw new RuntimeException("Échec de l'envoi de l'email OTP");
        }
    }

    /**
     * Envoie un code OTP pour la réinitialisation du mot de passe
     */
    public void sendPasswordResetEmail(String to, String code) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("Daar.Chain@gmail.com");
            helper.setTo(to);
            helper.setSubject("Réinitialisation de mot de passe");

            String htmlContent = String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                    <h2 style="color: #2196F3; text-align: center;">Réinitialisation de Mot de Passe</h2>
                    <p style="text-align: center;">Bonjour,</p>
                    <p style="text-align: center;">Vous avez demandé à réinitialiser votre mot de passe. Voici votre code de vérification :</p>
                    
                    <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; border: 1px solid #2196F3;">
                        <h3 style="margin: 0; color: #333;">CODE : %s</h3>
                    </div>
                    
                    <p style="text-align: center; color: #ff5722;"><strong>⚠️ Ce code est valide pendant 15 minutes.</strong></p>
                    
                    <p style="text-align: center;">Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
                        <p style="font-size: 12px; color: #666;">
                            Cordialement,<br>L'équipe
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """, code);

            helper.setText(htmlContent, true);
            mailSender.send(message);

            System.out.println("✅ Email de réinitialisation envoyé à: " + to);
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de l'envoi de l'email de réinitialisation: " + e.getMessage());
            throw new RuntimeException("Échec de l'envoi de l'email de réinitialisation");
        }
    }

    /**
     * Envoie un email de bienvenue à un nouvel agent
     */
    public void sendAgentWelcomeEmail(String email, String temporaryPassword) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("Daar.Chain@gmail.com");
            helper.setTo(email);
            helper.setSubject("Bienvenue en tant qu'Agent");

            String htmlContent = String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                    <h2 style="color: #4CAF50; text-align: center;">Bienvenue en tant qu'Agent !</h2>
                    <p style="text-align: center;">Votre compte agent a été créé avec succès.</p>
                    
                    <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #ddd;">
                        <p><strong>Email :</strong> %s</p>
                        <p><strong>Mot de passe temporaire :</strong> %s</p>
                    </div>
                    
                    <p style="text-align: center; color: #ff5722;"><strong>⚠️ Important :</strong> Veuillez changer ce mot de passe lors de votre première connexion.</p>
                    
                    <p style="text-align: center;">Vous pouvez maintenant vous connecter à votre compte et commencer à gérer les propriétés.</p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
                        <p style="font-size: 12px; color: #666;">
                            Si vous avez des questions, n'hésitez pas à contacter l'administrateur.<br>Cordialement,<br>L'équipe
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """, email, temporaryPassword);

            helper.setText(htmlContent, true);
            mailSender.send(message);

            System.out.println("✅ Email de bienvenue envoyé à l'agent: " + email);
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de l'envoi de l'email de bienvenue: " + e.getMessage());
            throw new RuntimeException("Échec de l'envoi de l'email de bienvenue");
        }
    }
}