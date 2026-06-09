package com.homeease.auth.controller;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import lombok.AllArgsConstructor; 
import lombok.Data;
import lombok.NoArgsConstructor; 
@JsonInclude(Include.NON_NULL) 
@AllArgsConstructor
@NoArgsConstructor
@Data 
public class Resp<T> {

    public enum Status {
        SUCCESS,
        ERROR
    }

    private Status status;
    private T data;
    private String msg;

    public static <T> Resp<T> success(T data) {
        return new Resp<>(Status.SUCCESS, data, null);
    }

    public static <T> Resp<T> error(String msg) {
        return new Resp<>(Status.ERROR, null, msg);
    }
}