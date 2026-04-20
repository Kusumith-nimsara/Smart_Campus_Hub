package com.smartcampus.hub.exception;

public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException() {
        super("A resource with this name already exists at this location");
    }
}
