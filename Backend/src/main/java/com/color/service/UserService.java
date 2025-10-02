package com.color.service;

import java.util.List;
import java.util.Optional;

import com.color.dto.RegisterReq;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.color.entity.User;
import com.color.repository.UserRepository;


@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JWTService jwtService;

    @Autowired
    AuthenticationManager authManager;

    

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
    
    public String registerUser(RegisterReq user) throws Exception {

        User oldUser = userRepository.findByEmail(user.getEmail());
        
        if(oldUser != null){
            
            return "User already exist";
        }
        
        User newUser = new User();
        newUser.setEmail(user.getEmail());
        newUser.setPassword(encoder.encode(user.getPassword()));
        

        Authentication authentication = new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword());
        String token = jwtService.generateToken(user.getEmail());

        userRepository.save(newUser);
        return token;
        
    }

    public String verify(RegisterReq user) {

        Authentication authentication = authManager.authenticate(new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword()));
        if (authentication.isAuthenticated()) {

            return jwtService.generateToken(user.getEmail());
        } else {
            return "fail";
        }
    }

    public User findById(Long id) throws Exception {
        Optional<User> user = userRepository.findById(id);
        if(user.isPresent()){
            return user.get();
        }
        throw new Exception("User not found of "+ id);
    }

    public User findByEmail(String email) {
        User user = userRepository.findByEmail(email);
        return user;
        
    }

    
    public User updateUser(User user, Long id) throws Exception {
        Optional<User> user1 = userRepository.findById(id);

        if(user1.isEmpty()){
            throw new Exception("User not exist of "+ id);
        }

        User oldUser = user1.get();

    
        if(user.getEmail() != null){
            oldUser.setEmail(user.getEmail());
        }

        User updatedUser = userRepository.save(oldUser);

        return updatedUser;
    }

    public void deleteUser(Long id) throws Exception {
        Optional<User> user1 = userRepository.findById(id);

        if(user1.isEmpty()){
            throw new Exception("User not exist of "+ id);
        }

        userRepository.deleteById(id);
        
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }


    public User getUserByToken(String token) {

        String pureToken = token.substring(7);
        String email = jwtService.extractUserName(pureToken);

        User user = findByEmail(email);
        return user;
    }


}
