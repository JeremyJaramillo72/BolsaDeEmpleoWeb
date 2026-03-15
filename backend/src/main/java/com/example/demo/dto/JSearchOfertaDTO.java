package com.example.demo.dto;

import lombok.Data;

@Data
public class JSearchOfertaDTO {
    private String jobId;
    private String jobTitle;
    private String employerName;
    private String jobEmploymentType;
    private String jobCity;
    private String jobState;
    private String jobCountry;
    private String jobDescription;
    private String jobPostedAt;
    private String jobApplyLink;
    private String jobGoogleLink;
    private boolean jobIsRemote;
}

