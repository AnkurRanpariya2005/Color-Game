package com.color.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BetRequest {

    private String userId;
    private Long eventId;
    private Color color;
    private Long amount;
}
