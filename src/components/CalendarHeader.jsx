import { useCalendarStore } from '../store/useCalendarStore';
import SearchBar from './SearchBar';
import './CalendarHeader.css';

function CalendarHeader({ onCreateEvent, onLogout, user }) {
  const { currentView, setView, currentDate, setDate } = useCalendarStore();

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (currentView === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (currentView === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (currentView === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (currentView === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setDate(newDate);
  };

  const handleToday = () => {
    setDate(new Date());
  };

  const getDateDisplay = () => {
    const options = currentView === 'month'
      ? { year: 'numeric', month: 'long' }
      : { year: 'numeric', month: 'long', day: 'numeric' };
    return currentDate.toLocaleDateString('en-US', options);
  };

  return (
    <header className="calendar-header">
      <div className="header-left">
        <h1>Calendar</h1>
        <button className="btn-today" onClick={handleToday}>Today</button>
        <div className="nav-buttons">
          <button onClick={handlePrevious}>&lt;</button>
          <button onClick={handleNext}>&gt;</button>
        </div>
        <h2>{getDateDisplay()}</h2>
      </div>

      <div className="header-right">
        <SearchBar />

        <div className="view-switcher">
          <button
            className={currentView === 'day' ? 'active' : ''}
            onClick={() => setView('day')}
          >
            Day
          </button>
          <button
            className={currentView === 'week' ? 'active' : ''}
            onClick={() => setView('week')}
          >
            Week
          </button>
          <button
            className={currentView === 'month' ? 'active' : ''}
            onClick={() => setView('month')}
          >
            Month
          </button>
          <button
            className={currentView === 'schedule' ? 'active' : ''}
            onClick={() => setView('schedule')}
          >
            Schedule
          </button>
        </div>

        <div className="user-menu">
          <span>{user?.name}</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </div>
    </header>
  );
}

export default CalendarHeader;
