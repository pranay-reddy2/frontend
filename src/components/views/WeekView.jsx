import { useCalendarStore } from '../../store/useCalendarStore';
import './WeekView.css';

function WeekView({ onEventClick }) {
  const { currentDate, events } = useCalendarStore();

  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const weekDays = getWeekDays();

  const getEventsForDay = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  return (
    <div className="week-view">
      <div className="week-header">
        {weekDays.map((day, index) => (
          <div key={index} className="week-day-header">
            <div className="day-name">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div className="day-date">{day.getDate()}</div>
          </div>
        ))}
      </div>

      <div className="week-grid">
        {weekDays.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          return (
            <div key={index} className="week-day">
              {dayEvents.map(event => (
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
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeekView;
