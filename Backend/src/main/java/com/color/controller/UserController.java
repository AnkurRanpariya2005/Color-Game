package com.color.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.color.entity.User;
import com.color.response.AuthResponse;
import com.color.service.UserService;

@RestController
@RequestMapping("/api/user")
public class UserController {
    
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public AuthResponse registerUser(@RequestBody User user) throws Exception {

        String token = userService.registerUser(user);
        AuthResponse response = new AuthResponse(token, "Registration successful");
        return response;
    }
    
    @PostMapping("/login")
    public AuthResponse loginUser(@RequestBody User user) {
        String token = userService.verify(user);
        AuthResponse response = new AuthResponse(token, "Login successful");
        return response;
    }

    @GetMapping("/get/{id}")
    public User getUserById(@PathVariable("id") Long id) throws Exception {
        return userService.findById(id);

    }

    @GetMapping("/all")
    public List<User> getAllUsers() {
        return userService.findAll();
    }

    @DeleteMapping("/delete/{id}")
    public void deleteUser(@PathVariable("id") Long id) throws Exception {
        userService.deleteUser(id);
    }

    @PutMapping("/update")
    public User updateUser(@RequestHeader("Authorization") String token, @RequestBody User user) throws Exception {

        User reqUser = userService.getUserByToken(token);
        return userService.updateUser(user, reqUser.getId());
    }


    @GetMapping("/profile")
    public User getUsernameFromToken(@RequestHeader("Authorization") String token) {
        
        User user = userService.getUserByToken(token);
        user.setPassword(null);
        return user;
        
    }
    
}
