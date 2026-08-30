package com.smartride.repository;

import com.smartride.model.Vehicle;
import com.smartride.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByDriver(User driver);
}
