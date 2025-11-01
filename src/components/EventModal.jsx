import { useState, useEffect } from 'react';
import { useCalendarStore } from '../store/useCalendarStore';
import './EventModal.css';

function EventModal({ event, onClose }) {
  const { calendars, createEvent, updateEvent, deleteEvent } = useCalendarStore();
  const isEditing = !!event;

  const [formData, setFormData] = useState({
    calendarId: event?.calendar_id || calendars[0]?.id || '',
    title: event?.title || '',
    description: event?.description || '',
    location: event?.location || '',
    startTime: event?.start_time ? new Date(event.start_time).toISOString().slice(0, 16) : '',
    endTime: event?.end_time ? new Date(event.end_time).toISOString().slice(0, 16) : '',
    isAllDay: event?.is_all_day || false,
    isRecurring: event?.is_recurring || false,
    recurrenceRule: event?.recurrence_rule || ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const eventData = {
      calendarId: parseInt(formData.calendarId),
      title: formData.title,
      description: formData.description,
      location: formData.location,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      isAllDay: formData.isAllDay,
      isRecurring: formData.isRecurring,
      recurrenceRule: formData.recurrenceRule || null
    };

    try {
      if (isEditing) {
        await updateEvent(event.id, eventData);
      } else {
        await createEvent(eventData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save event:', error);
      alert('Failed to save event');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const deleteAll = event.is_recurring && confirm('Delete all occurrences?');
      await deleteEvent(event.id, deleteAll);
      onClose();
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Failed to delete event');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Event' : 'New Event'}</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        <form className="event-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="calendarId">Calendar *</label>
            <select
              id="calendarId"
              name="calendarId"
              value={formData.calendarId}
              onChange={handleChange}
              required
            >
              {calendars.map(calendar => (
                <option key={calendar.id} value={calendar.id}>
                  {calendar.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Start *</label>
              <input
                type="datetime-local"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endTime">End *</label>
              <input
                type="datetime-local"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isAllDay"
                checked={formData.isAllDay}
                onChange={handleChange}
              />
              All day
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={handleChange}
              />
              Recurring event
            </label>
          </div>

          {formData.isRecurring && (
            <div className="form-group">
              <label htmlFor="recurrenceRule">Recurrence Rule (RRULE format)</label>
              <input
                type="text"
                id="recurrenceRule"
                name="recurrenceRule"
                value={formData.recurrenceRule}
                onChange={handleChange}
                placeholder="FREQ=DAILY;INTERVAL=1"
              />
              <small>Example: FREQ=DAILY;INTERVAL=1 (daily)</small>
            </div>
          )}

          <div className="modal-actions">
            <div>
              {isEditing && (
                <button
                  type="button"
                  className="btn-delete"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              )}
            </div>
            <div>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {isEditing ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventModal;
