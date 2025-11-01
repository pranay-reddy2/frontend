import { useEffect, useState } from 'react';
import { useCalendarStore } from '../store/useCalendarStore';
import { useAuthStore } from '../store/useAuthStore';
import CalendarHeader from '../components/CalendarHeader';
import CalendarSidebar from '../components/CalendarSidebar';
import CalendarView from '../components/CalendarView';
import EventModal from '../components/EventModal';
import './Calendar.css';

function Calendar() {
  const { user, logout } = useAuthStore();
  const { fetchCalendars, fetchEvents, currentDate, currentView } = useCalendarStore();
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchCalendars();
  }, []);

  useEffect(() => {
    // Calculate date range based on current view
    const { start, end } = getDateRange(currentDate, currentView);
    fetchEvents(start, end);
  }, [currentDate, currentView]);

  const getDateRange = (date, view) => {
    const start = new Date(date);
    const end = new Date(date);

    if (view === 'day') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (view === 'week') {
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      end.setDate(start.getDate() + 6);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (view === 'month') {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
    } else {
      // Schedule view - show 30 days
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() + 30);
      end.setHours(23, 59, 59, 999);
    }

    return { start, end };
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  return (
    <div className="calendar-page">
      <CalendarHeader onCreateEvent={handleCreateEvent} onLogout={logout} user={user} />

      <div className="calendar-main">
        <CalendarSidebar onCreateEvent={handleCreateEvent} />
        <CalendarView onEventClick={handleEditEvent} />
      </div>

      {showEventModal && (
        <EventModal
          event={selectedEvent}
          onClose={() => setShowEventModal(false)}
        />
      )}
    </div>
  );
}

export default Calendar;
