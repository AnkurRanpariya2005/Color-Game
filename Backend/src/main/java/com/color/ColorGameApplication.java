package com.color;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ColorGameApplication {

	public static void main(String[] args) {
		SpringApplication.run(ColorGameApplication.class, args);
	}

}
