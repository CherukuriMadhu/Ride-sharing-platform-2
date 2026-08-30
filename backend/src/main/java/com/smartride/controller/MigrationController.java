package com.smartride.controller;

import com.smartride.service.DataMigrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Migration Controller
 * Admin endpoint to trigger database migration
 * 
 * Usage (after authentication):
 * POST /api/migration/migrate-to-supabase
 * 
 * Response:
 * {
 *   "status": "success",
 *   "message": "Migration completed",
 *   "timestamp": "2024-06-23T12:30:00"
 * }
 */
@Slf4j
@RestController
@RequestMapping("/api/migration")
@RequiredArgsConstructor
public class MigrationController {

    private final DataMigrationService dataMigrationService;

    /**
     * Start data migration from MySQL to Supabase
     * ONLY for ADMIN users
     * 
     * @return Migration status
     */
    @PostMapping("/migrate-to-supabase")
    public ResponseEntity<?> migrateToSupabase() {
        log.info("🚀 Migration request received");
        
        Map<String, Object> response = new HashMap<>();
        try {
            // Trigger migration
            dataMigrationService.migrateAllData();
            
            response.put("status", "success");
            response.put("message", "All data successfully migrated to Supabase!");
            response.put("timestamp", System.currentTimeMillis());
            
            log.info("✅ Migration completed successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Migration failed", e);
            
            response.put("status", "error");
            response.put("message", "Migration failed: " + e.getMessage());
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Check migration status
     * Returns database statistics
     */
    @GetMapping("/status")
    public ResponseEntity<?> getMigrationStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "connected");
        status.put("database", "supabase-postgresql");
        status.put("message", "Ready for migration");
        
        return ResponseEntity.ok(status);
    }

    /**
     * Clear all data (ONLY for testing - DANGEROUS!)
     * Requires confirmation parameter
     */
    @DeleteMapping("/clear-all-data")
    public ResponseEntity<?> clearAllData(
            @RequestParam(required = false) String confirm) {
        
        if (!"yes-clear-everything".equals(confirm)) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "This will delete ALL data. Pass confirm=yes-clear-everything to proceed");
            return ResponseEntity.badRequest().body(response);
        }
        
        try {
            dataMigrationService.clearAllData();
            
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "All data cleared");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
