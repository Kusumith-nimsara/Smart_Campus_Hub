package com.smartcampus.hub.dto;

import com.smartcampus.hub.model.BookingStatus;
import java.time.LocalDateTime;

/**
 * DTO for filtering bookings based on various criteria.
 * Used when querying bookings with filters.
 */
public class BookingFilterDTO {
    
    private BookingStatus status;
    private LocalDateTime fromDate;
    private LocalDateTime toDate;
    private Long resourceId;
    private Long userId;
    private Integer page = 0;
    private Integer pageSize = 20;
    
    // ===== Constructors =====
    public BookingFilterDTO() {
    }
    
    public BookingFilterDTO(BookingStatus status, LocalDateTime fromDate, 
                           LocalDateTime toDate, Long resourceId) {
        this.status = status;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.resourceId = resourceId;
    }
    
    // ===== Getters and Setters =====
    public BookingStatus getStatus() {
        return status;
    }
    
    public void setStatus(BookingStatus status) {
        this.status = status;
    }
    
    public LocalDateTime getFromDate() {
        return fromDate;
    }
    
    public void setFromDate(LocalDateTime fromDate) {
        this.fromDate = fromDate;
    }
    
    public LocalDateTime getToDate() {
        return toDate;
    }
    
    public void setToDate(LocalDateTime toDate) {
        this.toDate = toDate;
    }
    
    public Long getResourceId() {
        return resourceId;
    }
    
    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public Integer getPage() {
        return page;
    }
    
    public void setPage(Integer page) {
        this.page = page != null ? page : 0;
    }
    
    public Integer getPageSize() {
        return pageSize;
    }
    
    public void setPageSize(Integer pageSize) {
        this.pageSize = pageSize != null ? pageSize : 20;
    }
    
    @Override
    public String toString() {
        return "BookingFilterDTO{" +
                "status=" + status +
                ", fromDate=" + fromDate +
                ", toDate=" + toDate +
                ", resourceId=" + resourceId +
                ", userId=" + userId +
                ", page=" + page +
                ", pageSize=" + pageSize +
                '}';
    }
}
