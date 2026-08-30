package com.smartride.repository;

import com.smartride.model.Review;
import com.smartride.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByReviewedUserIdOrderByCreatedAtDesc(Long reviewedUserId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewedUserId = :driverId")
    Double getAverageRatingForDriver(@Param("driverId") Long driverId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.reviewedUserId = :driverId")
    Long countByDriverId(@Param("driverId") Long driverId);

    boolean existsByRideIdAndPassengerId(Long rideId, Long passengerId);
}
