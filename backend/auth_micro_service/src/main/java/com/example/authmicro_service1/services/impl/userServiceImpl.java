package com.example.authmicro_service1.services.impl;

import com.example.authmicro_service1.dto.UserDto;
import com.example.authmicro_service1.entities.UserEntity;
import com.example.authmicro_service1.repositories.UserRepository;
import com.example.authmicro_service1.services.UserService;
import com.example.authmicro_service1.shared.Utils;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class userServiceImpl implements UserService {

    @Autowired
    UserRepository userRepository;

    @Autowired
    Utils utils;

    @Autowired
    BCryptPasswordEncoder bCryptPasswordEncoder;

    @Override
    public UserDto createUser(UserDto user) {

        UserEntity checkEntity = userRepository.findByEmail(user.getEmail());

        if (checkEntity != null) throw new RuntimeException("User already exists");

        UserEntity userEntity = new UserEntity();
        BeanUtils.copyProperties(user , userEntity);

        userEntity.setEncrypted_password(bCryptPasswordEncoder.encode(user.getPassword()));

        userEntity.setUserId(utils.generateUserId(32));

        UserEntity savedUserEntity = userRepository.save(userEntity);

        UserDto userDto = new UserDto();
        BeanUtils.copyProperties(savedUserEntity, userDto);

        return userDto;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserEntity userEntity =  userRepository.findByEmail(email);
        if (userEntity == null) throw new UsernameNotFoundException(email);
        return new User(userEntity.getEmail(), userEntity.getEncrypted_password(), new ArrayList<>());
    }

    @Override
    public UserDto getUser(String email) {
        UserEntity userEntity = userRepository.findByEmail(email);
        if (userEntity == null) throw new UsernameNotFoundException(email);

        UserDto userDto = new UserDto();
        BeanUtils.copyProperties(userEntity, userDto);
        return userDto;
    }

    @Override
    public UserDto getUserByUserId(String userId) {
        UserEntity userEntity = userRepository.findByUserId(userId);
        if(userEntity == null) throw new UsernameNotFoundException(userId);

        UserDto userDto = new UserDto();
        BeanUtils.copyProperties(userEntity, userDto);

        return userDto;
    }

    @Override
    public UserDto updateUser(String userId, UserDto userDto) {
        UserEntity userEntity = userRepository.findByUserId(userId);
        if(userEntity == null) throw new UsernameNotFoundException(userId);

        userEntity.setFirstname(userDto.getFirstname());
        userEntity.setLastname(userDto.getLastname());
        userEntity.setPhone(userDto.getPhone());
        userEntity.setCountry(userDto.getCountry());
        userEntity.setCity(userDto.getCity());
        userEntity.setState(userDto.getState());
        userEntity.setAddress(userDto.getAddress());
        userEntity.setProfile_image(userDto.getProfile_image());
        userEntity.setDate_of_birth(userDto.getDate_of_birth());

        UserEntity userUpdated = userRepository.save(userEntity);

        UserDto user = new UserDto();

        BeanUtils.copyProperties(userUpdated, user);

        return user;
    }

}


