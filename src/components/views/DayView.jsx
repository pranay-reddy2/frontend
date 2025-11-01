import { useCalendarStore } from '../../store/useCalendarStore';
import './DayView.css';

function DayView({ onEventClick }) {
  const { currentDate, events } = useCalendarStore();

  const dayEvents = events.filter(event => {
    const eventDate = new Date(event.start_time);
    return eventDate.toDateString() === currentDate.toDateString();
  });

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="day-view">
      <div className="day-header">
        <h3>{currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
      </div>

      <div className="day-grid">
        {hours.map(hour => (
          <div key={hour} className="hour-row">
            <div className="hour-label">
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </div>
            <div className="hour-cell">
              {dayEvents
                .filter(event => new Date(event.start_time).getHours() === hour)
                .map(event => (
                  <div
                    key={event.id}
                    className="event-block"
                    style={{ backgroundColor: event.calendar_color || '#1a73e8' }}
                    onClick={() => onEventClick(event)}
                  >
                    <div className="event-time">
                      {new Date(event.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </div>
                    <div className="event-title">{event.title}</div>
                    {event.location && <div className="event-location">{event.location}</div>}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DayView;
