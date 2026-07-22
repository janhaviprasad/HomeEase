package com.homeease.auth.controller;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ErrorHandlerRestControllerAdvice {
	
	@ExceptionHandler
	public Resp<?> handleError(Exception e)
	{
		return Resp.error(e.getClass().getName()+" :"+e.getMessage());
	}

}

