package com.smartcampus.hub.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        // Always set sender name as 'Smart Campus Hub'
        message.setFrom("Smart Campus Hub <" + mailSenderUsername() + ">");
        mailSender.send(message);
    }

    // Helper to get the configured username
    private String mailSenderUsername() {
        // This will be replaced by Spring with the configured username
        // If you want to make it dynamic, inject it via @Value
        return System.getenv().getOrDefault("MAIL_USERNAME", "vihanga.shehan99@gmail.com");
    }
}
