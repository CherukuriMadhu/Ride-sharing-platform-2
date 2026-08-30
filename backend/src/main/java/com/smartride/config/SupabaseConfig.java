package com.smartride.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import lombok.Getter;

/**
 * Supabase Configuration Class
 * Stores all Supabase credentials and configuration
 */
@Configuration
@Getter
@ConditionalOnProperty(name = "supabase.enabled", havingValue = "true", matchIfMissing = false)
public class SupabaseConfig {

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Value("${supabase.anon-key:}")
    private String anonKey;

    @Value("${supabase.service-role-key:}")
    private String serviceRoleKey;

    @Value("${supabase.storage.bucket-name:smartride-files}")
    private String bucketName;

    @Value("${supabase.storage.avatars-folder:avatars}")
    private String avatarsFolder;

    @Value("${supabase.storage.documents-folder:documents}")
    private String documentsFolder;

    /**
     * Validate Supabase configuration
     * Call this to ensure all required fields are set
     */
    public void validateConfiguration() {
        if (supabaseUrl == null || supabaseUrl.isEmpty()) {
            throw new IllegalArgumentException("supabase.url must be configured");
        }
        if (anonKey == null || anonKey.isEmpty()) {
            throw new IllegalArgumentException("supabase.anon-key must be configured");
        }
        if (serviceRoleKey == null || serviceRoleKey.isEmpty()) {
            throw new IllegalArgumentException("supabase.service-role-key must be configured");
        }
    }

    @Override
    public String toString() {
        return "SupabaseConfig{" +
                "supabaseUrl='" + supabaseUrl + '\'' +
                ", bucketName='" + bucketName + '\'' +
                ", anonKey=[REDACTED]" +
                ", serviceRoleKey=[REDACTED]" +
                '}';
    }
}
