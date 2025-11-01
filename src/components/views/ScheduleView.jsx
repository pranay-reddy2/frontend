import { useCalendarStore } from '../../store/useCalendarStore';
import './ScheduleView.css';

function ScheduleView({ onEventClick }) {
  const { events } = useCalendarStore();

  const sortedEvents = [...events].sort((a, b) =>
    new Date(a.start_time) - new Date(b.start_time)
  );

  const groupByDate = () => {
    const grouped = {};
    sortedEvents.forEach(event => {
      const date = new Date(event.start_time).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(event);
    });
    return grouped;
  };

  const groupedEvents = groupByDate();

  return (
    <div className="schedule-view">
      <h2>Schedule</h2>

      {Object.entries(groupedEvents).map(([date, dateEvents]) => (
        <div key={date} className="schedule-day">
          <div className="schedule-date">
            {new Date(dateEvents[0].start_time).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </div>

          <div className="schedule-events">
            {dateEvents.map(event => (
              <div
                key={event.id}
                className="schedule-event"
                onClick={() => onEventClick(event)}
              >
                <div
                  className="event-color-bar"
                  style={{ backgroundColor: event.calendar_color || '#1a73e8' }}
                />
                <div className="event-details">
                  <div className="event-time">
                    {new Date(event.start_time).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    })} - {new Date(event.end_time).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="event-title">{event.title}</div>
                  {event.location && (
                    <div className="event-location">{event.location}</div>
                  )}
                  {event.description && (
                    <div className="event-description">{event.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {Object.keys(groupedEvents).length === 0 && (
        <div className="no-events">No events scheduled</div>
      )}
    </div>
  );
}

export default ScheduleView;
