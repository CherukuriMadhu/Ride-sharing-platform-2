package com.smartride.repository;

import com.smartride.model.Notification;
import com.smartride.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Notification> findByUserIdAndIsReadFalse(Long userId);

    long countByUserIdAndIsReadFalse(Long userId);

    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    long countByUserAndIsReadFalse(User user);
}
