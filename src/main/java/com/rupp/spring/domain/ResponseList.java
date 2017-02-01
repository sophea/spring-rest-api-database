package com.rupp.spring.domain;

import java.io.Serializable;
import java.util.Collection;

/**
 * Response object for a list result with parameters needed to do pagination.<p/>
 * This class intended in order to implement response with all data required for straightforward and backward
 * pagination.<p/>
 * There are two types of straightforward pagination:
 * <ul>
 * <li>cursor type of pagination which can be used in all cases when it's not required to implement granular
 * pagination with choosing a certain page or without backward pagination.</li>
 * <li>offset/limit type of pagination in case if it's necessary to provide granular pagination with choosing certain
 * page</li>
 * </ul>
 * This class overrides {@link #equals(Object)} and {@link #hashCode()} methods, so object of this class can be easily
 * used to compare objects, especially it's helpful for preparing unit tests. <p/>
 * {@link #reverseCursor} intended especially for backward pagination.
 *
 * @param <T> Class type for list items.
 */
public class ResponseList<T> implements Serializable {

	private static final long serialVersionUID = 3629349109049130928L;

	/** Response collection of objects. */
	private Collection<T> items;

	/**
	 * Value that specifies whether there are next elements on the server. Values:
	 * <ul>
	 * <li>true - if there are next items;</li>
	 * <li>false / null - if there are no any items more.</li>
	 * </ul>
	 */
	private Boolean hasNext;

	/**
	 * This is a value that identifies the key to the next portion of data. Value generates on the server on first
	 * request and should be provided in next request of next portion of data.<p/>
	 * This value should be used only if hasNext value is true. <br/>
	 * This value can contain any information which the server can pack there.
	 */
	private String cursor;

	/**
	 * Value that specifies the number of requested items. This value in response could be helpful for efficient
	 * pagination in case when the request was called with default value for this parameter.<p/>
	 */
	private Integer limit;

	/**
	 * Value that specifies number of entities in the storage.<p/>
	 * null - if number of values is impossible to determine, or it's not necessary according to logic. But client can
	 * analyze hasNext parameter. <br/>
	 * In case if it's necessary to do strict pagination with number of pages, with switching between pages, etc. then
	 * that function can implement that functionality.
	 */
	private Integer total;

	/**
	 * This value is for providing reverse cursor required for backward pagination.
	 * In most cases this value makes sense only if it's returned in initial request, for example to provide an ability
	 * for retrieving new items created after initial (first) request, i.e. backward from 0 page<br/>
	 * In some cases this value can be returned in all responses, not only in initial one, if business logic suppose
	 * that, in order to provide reverse pagination from every position, let's say from 4th or 5th pages etc.
	 */
	private String reverseCursor;

	/**
	 * Default constructor for deserialization purposes.
	 */
	public ResponseList() {
	}

	/**
	 * Constructor on base of items only. hasNext and total are defined accordingly.
	 *
	 * @param items collection of items
	 */
	public ResponseList(final Collection<T> items) {
		this.items = items;
		this.hasNext = false;
		this.total = items.size();
	}

	
	/**
	 * Constructor on base of items and cursor. hasNext is applied accordingly.
	 *
	 * @param items  collection of items
	 * @param cursor cursor
	 */
	public ResponseList(final Collection<T> items, final String cursor) {
		this.items = items;
		this.hasNext = cursor != null && !cursor.isEmpty();
		this.cursor = cursor;
	}

	

	
	
	

	public Boolean getHasNext() {
		return hasNext;
	}

	public String getCursor() {
		return cursor;
	}


	public ResponseList<T> withLimit(final Integer limit) {
		this.limit = limit;
		return this;
	}

	public Integer getLimit() {
		return limit;
	}

	public ResponseList<T> withTotal(final Integer total) {
		this.total = total;
		return this;
	}

	public Integer getTotal() {
		return total;
	}

	public String getReverseCursor() {
		return reverseCursor;
	}

	public ResponseList<T> withReverseCursor(final String reverseCursor) {
		this.reverseCursor = reverseCursor;
		return this;
	}

	@Override
	public boolean equals(final Object o) {
		if (this == o) {
			return true;
		}
		if (o == null || getClass() != o.getClass()) {
			return false;
		}

		ResponseList that = (ResponseList) o;

		if (cursor != null ? !cursor.equals(that.cursor) : that.cursor != null) {
			return false;
		}
		if (hasNext != null ? !hasNext.equals(that.hasNext) : that.hasNext != null) {
			return false;
		}
		if (items != null ? !items.equals(that.items) : that.items != null) {
			return false;
		}
		if (limit != null ? !limit.equals(that.limit) : that.limit != null) {
			return false;
		}
		if (reverseCursor != null ? !reverseCursor.equals(that.reverseCursor) : that.reverseCursor != null) {
			return false;
		}
		if (total != null ? !total.equals(that.total) : that.total != null) {
			return false;
		}

		return true;
	}

	@Override
	public int hashCode() {
		int result = items != null ? items.hashCode() : 0;
		result = 31 * result + (hasNext != null ? hasNext.hashCode() : 0);
		result = 31 * result + (cursor != null ? cursor.hashCode() : 0);
		result = 31 * result + (limit != null ? limit.hashCode() : 0);
		result = 31 * result + (total != null ? total.hashCode() : 0);
		result = 31 * result + (reverseCursor != null ? reverseCursor.hashCode() : 0);
		return result;
	}

	@Override
	public String toString() {
		final StringBuilder sb = new StringBuilder("ResponseList{");
		sb.append("items = ").append(items);
		sb.append(", hasNext = ").append(hasNext);
		sb.append(", cursor = '").append(cursor).append('\'');
		sb.append(", limit = ").append(limit);
		sb.append(", total = ").append(total);
		sb.append(", reverseCursor = '").append(reverseCursor).append('\'');
		sb.append('}');
		return sb.toString();
	}

    /**
     * @return the items
     */
    public Collection<T> getItems() {
        return items;
    }

    /**
     * @param items the items to set
     */
    public void setItems(Collection<T> items) {
        this.items = items;
    }
}