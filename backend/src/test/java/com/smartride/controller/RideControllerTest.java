package com.smartride.controller;

import com.smartride.model.Ride;
import com.smartride.model.User;
import com.smartride.repository.RideRepository;
import com.smartride.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
public class RideControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RideRepository rideRepository;

    @MockBean
    private UserRepository userRepository;

    @Test
    @WithMockUser
    public void testGetRidesByDriver() throws Exception {
        Long driverId = 1L;
        User driver = new User();
        driver.setId(driverId);

        Ride ride = new Ride();
        ride.setId(101L);
        ride.setDriver(driver);

        when(userRepository.findById(driverId)).thenReturn(Optional.of(driver));
        when(rideRepository.findByDriver(driver)).thenReturn(Collections.singletonList(ride));

        mockMvc.perform(get("/api/rides/driver/" + driverId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(101L));
    }
}
