package com.example.authmicro_service1.controller;


import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    @GetMapping
    public String getAllUsers() {
        return "Get all users called";
    }

    @PostMapping
    public String addUser() {
        return "Add user called";
    }

    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id) {
        return "Delete user with ID: " + id;
    }

    @PutMapping("/{id}")
    public String updateUser(@PathVariable Long id) {
        return "Update user with ID: " + id;
    }
}