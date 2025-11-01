import { create } from 'zustand';
import { calendarsAPI } from '../api/calendars';
import { eventsAPI } from '../api/events';

export const useCalendarStore = create((set, get) => ({
  calendars: [],
  selectedCalendars: [],
  events: [],
  currentView: 'month', // day, week, month, schedule
  currentDate: new Date(),
  loading: false,
  error: null,

  // Calendar CRUD
  fetchCalendars: async () => {
    set({ loading: true, error: null });
    try {
      const calendars = await calendarsAPI.getAll();
      const selectedCalendars = calendars.map(c => c.id);
      set({ calendars, selectedCalendars, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createCalendar: async (data) => {
    try {
      const calendar = await calendarsAPI.create(data);
      set(state => ({
        calendars: [...state.calendars, calendar],
        selectedCalendars: [...state.selectedCalendars, calendar.id]
      }));
      return calendar;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateCalendar: async (id, data) => {
    try {
      const calendar = await calendarsAPI.update(id, data);
      set(state => ({
        calendars: state.calendars.map(c => c.id === id ? calendar : c)
      }));
      return calendar;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteCalendar: async (id) => {
    try {
      await calendarsAPI.delete(id);
      set(state => ({
        calendars: state.calendars.filter(c => c.id !== id),
        selectedCalendars: state.selectedCalendars.filter(cId => cId !== id)
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  toggleCalendar: (calendarId) => {
    set(state => {
      const isSelected = state.selectedCalendars.includes(calendarId);
      return {
        selectedCalendars: isSelected
          ? state.selectedCalendars.filter(id => id !== calendarId)
          : [...state.selectedCalendars, calendarId]
      };
    });
  },

  // Events CRUD
  fetchEvents: async (startDate, endDate) => {
    const { selectedCalendars } = get();
    if (selectedCalendars.length === 0) {
      set({ events: [] });
      return;
    }

    set({ loading: true, error: null });
    try {
      const events = await eventsAPI.getAll({
        calendarIds: selectedCalendars.join(','),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      set({ events, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createEvent: async (data) => {
    try {
      const event = await eventsAPI.create(data);
      set(state => ({ events: [...state.events, event] }));
      return event;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateEvent: async (id, data) => {
    try {
      const event = await eventsAPI.update(id, data);
      set(state => ({
        events: state.events.map(e => e.id === id ? event : e)
      }));
      return event;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteEvent: async (id, deleteAll = false) => {
    try {
      await eventsAPI.delete(id, deleteAll);
      set(state => ({
        events: state.events.filter(e => e.id !== id)
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // View controls
  setView: (view) => set({ currentView: view }),
  setDate: (date) => set({ currentDate: date }),

  // Search
  searchEvents: async (query) => {
    const { selectedCalendars } = get();
    try {
      const events = await eventsAPI.search(query, selectedCalendars.join(','));
      return events;
    } catch (error) {
      set({ error: error.message });
      return [];
    }
  },
}));
