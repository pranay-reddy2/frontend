import { useCalendarStore } from '../store/useCalendarStore';
import MonthView from './views/MonthView';
import WeekView from './views/WeekView';
import DayView from './views/DayView';
import ScheduleView from './views/ScheduleView';
import './CalendarView.css';

function CalendarView({ onEventClick }) {
  const { currentView } = useCalendarStore();

  return (
    <div className="calendar-view">
      {currentView === 'month' && <MonthView onEventClick={onEventClick} />}
      {currentView === 'week' && <WeekView onEventClick={onEventClick} />}
      {currentView === 'day' && <DayView onEventClick={onEventClick} />}
      {currentView === 'schedule' && <ScheduleView onEventClick={onEventClick} />}
    </div>
  );
}

export default CalendarView;
