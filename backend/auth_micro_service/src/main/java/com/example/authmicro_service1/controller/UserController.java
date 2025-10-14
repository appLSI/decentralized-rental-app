package com.example.authmicro_service1.controller;


import com.example.authmicro_service1.dto.UserDto;
import com.example.authmicro_service1.requests.UserRequest;
import com.example.authmicro_service1.responses.UserResponse;
import com.example.authmicro_service1.services.UserService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    UserService userService;

    @GetMapping(path="/{id}")
    public UserResponse getUser(@PathVariable String id) {

        UserDto userDto = userService.getUserByUserId(id);
        UserResponse userResponse = new UserResponse();
        BeanUtils.copyProperties(userDto, userResponse);

        return userResponse;
    }

    @PostMapping
    public UserResponse addUser(@RequestBody UserRequest userRequest) {
        UserDto userDto = new UserDto();
        BeanUtils.copyProperties(userRequest, userDto);

        UserDto creatUser = userService.createUser(userDto);

        UserResponse userResponse = new UserResponse();

        BeanUtils.copyProperties(creatUser, userResponse);
        return userResponse;
    }

    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id) {
        return "Delete user with ID: " + id;
    }

    @PutMapping("/{id}")
    public UserResponse updateUser(@PathVariable String id,  @RequestBody UserRequest userRequest) {

        UserDto userDto = new UserDto();
        BeanUtils.copyProperties(userRequest, userDto);

        UserDto updtaeuser = userService.updateUser(id, userDto);

        UserResponse userResponse = new UserResponse();

        BeanUtils.copyProperties(updtaeuser, userResponse);
        return userResponse;
    }
}