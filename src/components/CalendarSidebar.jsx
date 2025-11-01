import { useState } from 'react';
import { useCalendarStore } from '../store/useCalendarStore';
import CalendarShareModal from './CalendarShareModal';
import './CalendarSidebar.css';

function CalendarSidebar({ onCreateEvent }) {
  const { calendars, selectedCalendars, toggleCalendar, createCalendar } = useCalendarStore();
  const [showNewCalendar, setShowNewCalendar] = useState(false);
  const [newCalendarName, setNewCalendarName] = useState('');
  const [shareCalendar, setShareCalendar] = useState(null);

  const handleCreateCalendar = async (e) => {
    e.preventDefault();
    if (!newCalendarName.trim()) return;

    try {
      await createCalendar({
        name: newCalendarName,
        description: '',
        color: getRandomColor()
      });
      setNewCalendarName('');
      setShowNewCalendar(false);
    } catch (error) {
      console.error('Failed to create calendar:', error);
    }
  };

  const getRandomColor = () => {
    const colors = ['#1a73e8', '#d93025', '#f4b400', '#0f9d58', '#ab47bc', '#ff6d00'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <aside className="calendar-sidebar">
      <button className="btn-create-event" onClick={onCreateEvent}>
        + Create
      </button>

      <div className="sidebar-section">
        <div className="section-header">
          <h3>My Calendars</h3>
          <button onClick={() => setShowNewCalendar(!showNewCalendar)}>+</button>
        </div>

        {showNewCalendar && (
          <form className="new-calendar-form" onSubmit={handleCreateCalendar}>
            <input
              type="text"
              placeholder="Calendar name"
              value={newCalendarName}
              onChange={(e) => setNewCalendarName(e.target.value)}
              autoFocus
            />
            <div className="form-actions">
              <button type="submit">Add</button>
              <button type="button" onClick={() => setShowNewCalendar(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="calendar-list">
          {calendars.map(calendar => (
            <div key={calendar.id} className="calendar-item-wrapper">
              <label className="calendar-item">
                <input
                  type="checkbox"
                  checked={selectedCalendars.includes(calendar.id)}
                  onChange={() => toggleCalendar(calendar.id)}
                />
                <span
                  className="calendar-color"
                  style={{ backgroundColor: calendar.color }}
                />
                <span className="calendar-name">{calendar.name}</span>
              </label>
              {calendar.owner_id && (
                <button
                  className="btn-share"
                  onClick={() => setShareCalendar(calendar)}
                  title="Share calendar"
                >
                  ⋯
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {shareCalendar && (
        <CalendarShareModal
          calendar={shareCalendar}
          onClose={() => setShareCalendar(null)}
        />
      )}
    </aside>
  );
}

export default CalendarSidebar;
