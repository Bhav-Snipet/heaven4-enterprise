package com.heaven4.core;

import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Standard paginated response for all Heaven4 list endpoints.
 *
 * @param <T> The type of items in the page
 */
@Getter
public class PageResponse<T> {

    private final List<T> content;
    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;
    private final boolean first;
    private final boolean last;
    private final boolean empty;

    private PageResponse(Page<T> page) {
        this.content = page.getContent();
        this.page = page.getNumber();
        this.size = page.getSize();
        this.totalElements = page.getTotalElements();
        this.totalPages = page.getTotalPages();
        this.first = page.isFirst();
        this.last = page.isLast();
        this.empty = page.isEmpty();
    }

    /**
     * Creates a PageResponse from a Spring Data Page object.
     */
    public static <T> PageResponse<T> of(Page<T> page) {
        return new PageResponse<>(page);
    }
}
