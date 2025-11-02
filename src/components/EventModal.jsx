import { useState, useEffect } from "react";
import { useCalendarStore } from "../store/useCalendarStore";
import RecurringEventPicker from "./RecurringEventPicker";
import ReminderPicker from "./ReminderPicker";
import AttendeePicker from "./AttendeePicker";
import EventColorPicker from "./EventColorPicker";
import HolidayBadge from "./HolidayBadge";
import RecurringEditDialog from "./RecurringEditDialog";

function EventModal({ event, onClose, onEventSaved }) {
  const {
    calendars,
    createEvent,
    updateEvent,
    deleteEvent,
    fetchEvents,
    currentDate,
    currentView,
  } = useCalendarStore();
  const isEditing = !!event;
  const isRecurring = event?.recurrence_rule;

  const [formData, setFormData] = useState({
    calendarId: event?.calendar_id || calendars[0]?.id || "",
    title: event?.title || "",
    description: event?.description || "",
    location: event?.location || "",
    startTime: event?.start_time
      ? new Date(event.start_time).toISOString().slice(0, 16)
      : "",
    endTime: event?.end_time
      ? new Date(event.end_time).toISOString().slice(0, 16)
      : "",
    isAllDay: event?.is_all_day || false,
    timezone: event?.timezone || "Asia/Kolkata",
    recurrenceRule: event?.recurrence_rule || null,
    color: event?.color || null,
  });

  const [reminders, setReminders] = useState(() => {
    if (event?.reminders && event.reminders.length > 0) {
      return event.reminders.map((r, idx) => ({
        id: r.id || Date.now() + idx,
        minutes_before: r.minutes_before,
        method: r.method || "notification",
      }));
    }
    // Default reminder for new events
    return [{ id: Date.now(), minutes_before: 10, method: "notification" }];
  });
  const [attendees, setAttendees] = useState([]);
  const [showRecurring, setShowRecurring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendNotifications, setSendNotifications] = useState(true);
  const [showRecurringDialog, setShowRecurringDialog] = useState(false);
  const [recurringEditScope, setRecurringEditScope] = useState(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // Initialize with default end time if creating new event
  useEffect(() => {
    if (!isEditing && formData.startTime && !formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour
      setFormData((prev) => ({
        ...prev,
        endTime: end.toISOString().slice(0, 16),
      }));
    }
  }, [formData.startTime, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox" && name === "isAllDay") {
      // When toggling all-day, adjust date formats
      if (checked) {
        // Convert datetime-local to date format
        setFormData((prev) => ({
          ...prev,
          isAllDay: true,
          startTime: prev.startTime ? prev.startTime.split("T")[0] : "",
          endTime: prev.endTime ? prev.endTime.split("T")[0] : "",
        }));
      } else {
        // Convert date to datetime-local format (add default time)
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(
          2,
          "0"
        )}:${String(now.getMinutes()).padStart(2, "0")}`;
        setFormData((prev) => ({
          ...prev,
          isAllDay: false,
          startTime: prev.startTime ? `${prev.startTime}T${currentTime}` : "",
          endTime: prev.endTime ? `${prev.endTime}T${currentTime}` : "",
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleRecurrenceChange = (rrule) => {
    setFormData((prev) => ({
      ...prev,
      recurrenceRule: rrule,
    }));
    setShowRecurring(false);
  };

  const getRecurrenceText = () => {
    if (!formData.recurrenceRule) return "Does not repeat";
    const rule = formData.recurrenceRule;
    if (rule === "FREQ=DAILY;INTERVAL=1") return "Daily";
    if (rule === "FREQ=WEEKLY;INTERVAL=1") return "Weekly";
    if (rule === "FREQ=MONTHLY;INTERVAL=1") return "Monthly";
    if (rule === "FREQ=YEARLY;INTERVAL=1") return "Yearly";
    if (rule.includes("BYDAY=MO,TU,WE,TH,FR")) return "Every weekday";
    return "Custom";
  };

  const refreshEvents = async () => {
    // Get date range based on current view
    const getDateRange = (date, view) => {
      const start = new Date(date);
      const end = new Date(date);

      if (view === "day") {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      } else if (view === "week") {
        const day = start.getDay();
        start.setDate(start.getDate() - day);
        end.setDate(start.getDate() + 6);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      } else if (view === "month") {
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
      } else {
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() + 30);
        end.setHours(23, 59, 59, 999);
      }

      return { start, end };
    };

    const { start, end } = getDateRange(currentDate, currentView);
    await fetchEvents(start, end);
  };
  const sendEmailNotifications = async (eventId, eventData, attendeeEmails) => {
    if (!sendNotifications || attendeeEmails.length === 0) return;

    try {
      const response = await fetch("/api/events/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          eventId,
          eventData: {
            title: eventData.title,
            description: eventData.description,
            location: eventData.location,
            startTime: eventData.startTime,
            endTime: eventData.endTime,
            isAllDay: eventData.isAllDay,
          },
          attendeeEmails,
          notificationType: isEditing ? "update" : "invite",
        }),
      });

      if (!response.ok) {
        console.warn("Email notifications feature not available yet");
      } else {
        console.log("Email notifications sent successfully");
      }
    } catch (error) {
      console.warn("Email notifications feature not available:", error.message);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Validate required fields
    if (!formData.title.trim()) {
      alert("Please enter an event title");
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      alert("Please enter start and end times");
      return;
    }

    // Check if editing recurring event
    if (isEditing && isRecurring && !recurringEditScope) {
      setShowRecurringDialog(true);
      return;
    }

    setIsSubmitting(true);

    const eventData = {
      calendarId: parseInt(formData.calendarId),
      title: formData.title,
      description: formData.description,
      location: formData.location,
      startTime: formData.isAllDay
        ? new Date(formData.startTime + "T00:00:00").toISOString()
        : new Date(formData.startTime).toISOString(),
      endTime: formData.isAllDay
        ? new Date(formData.endTime + "T23:59:59").toISOString()
        : new Date(formData.endTime).toISOString(),
      isAllDay: formData.isAllDay,
      timezone: formData.timezone,
      isRecurring: !!formData.recurrenceRule,
      recurrenceRule: formData.recurrenceRule,
      color: formData.color,
      reminders: reminders
        .filter(
          (r) => r.minutes_before !== null && r.minutes_before !== undefined
        )
        .map((r) => ({
          minutes_before: parseInt(r.minutes_before),
          method: r.method || "notification",
        })),
      attendees: attendees.map((a) => a.email),
    };

    try {
      let eventId;
      if (isEditing) {
        const baseEventId = event.id.toString().split("_")[0];
        await updateEvent(baseEventId, eventData, recurringEditScope);
        eventId = baseEventId;
      } else {
        console.log("Creating event with data:", eventData);
        const result = await createEvent(eventData);
        eventId = result?.id || result?.data?.id;
      }

      // Only send email notifications if we have attendees
      if (attendees.length > 0) {
        const attendeeEmails = attendees.map((a) => a.email);
        await sendEmailNotifications(eventId, eventData, attendeeEmails);
      }

      // Refresh events to show the new/updated event
      await refreshEvents();

      // Call the callback if provided
      if (onEventSaved) {
        onEventSaved();
      }

      onClose();
    } catch (error) {
      console.error("Failed to save event:", error);
      console.error("Event data that failed:", eventData);

      // Check if it's actually a success despite the error
      if (error.response?.status === 500 && error.response?.data?.event) {
        console.log("Event created successfully despite 500 error");
        await refreshEvents();
        if (onEventSaved) {
          onEventSaved();
        }
        onClose();
        return;
      }

      alert(
        `Failed to save event: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const baseEventId = event.id.toString().split("_")[0];
      const deleteAll =
        formData.recurrenceRule &&
        window.confirm("Delete all occurrences of this recurring event?");

      if (sendNotifications && attendees.length > 0) {
        try {
          await fetch("/api/events/notify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              eventId: baseEventId,
              eventData: {
                title: formData.title,
                startTime: formData.startTime,
                endTime: formData.endTime,
              },
              attendeeEmails: attendees.map((a) => a.email),
              notificationType: "cancel",
            }),
          });
        } catch (error) {
          console.warn("Could not send cancellation emails:", error.message);
        }
      }

      await deleteEvent(baseEventId, deleteAll);

      // Refresh events to remove the deleted event
      await refreshEvents();

      // Call the callback if provided
      if (onEventSaved) {
        onEventSaved();
      }

      onClose();
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert("Failed to delete event. Please try again.");
    }
  };

  const handleRecurringDialogSelect = (scope) => {
    setRecurringEditScope(scope);
    setShowRecurringDialog(false);
    // Trigger submit after scope is selected
    setTimeout(() => handleSubmit(), 0);
  };

  const selectedCalendar = calendars.find(
    (c) => c.id === parseInt(formData.calendarId)
  );

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-[#1E1F20] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transition-colors duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div
              className="w-4 h-4 rounded-full mr-4 flex-shrink-0"
              style={{
                backgroundColor:
                  formData.color || selectedCalendar?.color || "#1a73e8",
              }}
            />
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              autoFocus
              placeholder="Add title"
              className="flex-1 text-2xl font-normal text-gray-800 dark:text-gray-100 border-none outline-none bg-transparent placeholder-gray-400 dark:placeholder-gray-500"
            />
            <button
              type="button"
              className="w-10 h-10 ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
              onClick={onClose}
            >
              <span className="material-icons-outlined text-gray-700 dark:text-gray-300">
                close
              </span>
            </button>
          </div>

          {/* Modal body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
            <div className="space-y-4">
              {/* Holiday indicator */}
              {formData.startTime && <HolidayBadge date={formData.startTime} />}

              {/* Date/Time */}
              <div className="flex items-start gap-4">
                <span className="material-icons-outlined text-gray-600 dark:text-gray-400 w-6 flex-shrink-0 mt-2">
                  schedule
                </span>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type={formData.isAllDay ? "date" : "datetime-local"}
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      required
                      className="input-field text-sm bg-gray-50 dark:bg-[#2A2B2D] text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700 rounded flex-1 min-w-[150px]"
                    />
                    <span className="text-gray-600 dark:text-gray-400">–</span>
                    <input
                      type={formData.isAllDay ? "date" : "datetime-local"}
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      required
                      className="input-field text-sm bg-gray-50 dark:bg-[#2A2B2D] text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700 rounded flex-1 min-w-[150px]"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isAllDay"
                      checked={formData.isAllDay}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 dark:text-blue-500 border-gray-300 dark:border-gray-700 rounded focus:ring-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      All day
                    </span>
                  </label>
                </div>
              </div>

              {/* Timezone */}
              {!formData.isAllDay && (
                <div className="flex items-center gap-4">
                  <span className="material-icons-outlined text-gray-600 dark:text-gray-400 w-6 flex-shrink-0">
                    public
                  </span>
                  <div className="flex-1">
                    <select
                      value={formData.timezone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          timezone: e.target.value,
                        }))
                      }
                      className="input-field text-sm w-full bg-gray-50 dark:bg-[#2A2B2D] text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700 rounded"
                    >
                      <option value="Asia/Kolkata">
                        India Standard Time (IST)
                      </option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Recurrence */}
              <div className="flex items-start gap-4">
                <span className="material-icons-outlined text-gray-600 dark:text-gray-400 w-6 flex-shrink-0 mt-2">
                  repeat
                </span>
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={() => setShowRecurring(!showRecurring)}
                    className="text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded transition-colors flex items-center gap-1"
                  >
                    {getRecurrenceText()}
                    <span className="material-icons-outlined text-sm">
                      {showRecurring ? "expand_less" : "expand_more"}
                    </span>
                  </button>
                  {showRecurring && (
                    <div className="mt-2">
                      <RecurringEventPicker
                        value={formData.recurrenceRule}
                        onChange={handleRecurrenceChange}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Calendar selector */}
              <div className="flex items-center gap-4">
                <span className="material-icons-outlined text-gray-600 dark:text-gray-400 w-6 flex-shrink-0">
                  calendar_today
                </span>
                <select
                  name="calendarId"
                  value={formData.calendarId}
                  onChange={handleChange}
                  required
                  className="input-field text-sm flex-1 bg-gray-50 dark:bg-[#2A2B2D] text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700 rounded"
                >
                  {calendars.map((calendar) => (
                    <option key={calendar.id} value={calendar.id}>
                      {calendar.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* More Options Toggle */}
              <button
                type="button"
                onClick={() => setShowMoreOptions(!showMoreOptions)}
                className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span className="material-icons-outlined text-sm">
                  {showMoreOptions ? "expand_less" : "expand_more"}
                </span>
                {showMoreOptions ? "Less options" : "More options"}
              </button>

              {showMoreOptions && (
                <>
                  {/* Color */}
                  <div className="flex items-center gap-4">
                    <span className="material-icons-outlined text-gray-600 dark:text-gray-400 w-6 flex-shrink-0">
                      palette
                    </span>
                    <EventColorPicker
                      value={formData.color}
                      onChange={(color) =>
                        setFormData((prev) => ({ ...prev, color }))
                      }
                    />
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-4">
                    <span className="material-icons-outlined text-gray-600 dark:text-gray-400 w-6 flex-shrink-0">
                      location_on
                    </span>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Add location"
                      className="input-field text-sm flex-1 bg-gray-50 dark:bg-[#2A2B2D] text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700 rounded"
                    />
                  </div>

                  {/* Reminders */}
                  <div className="flex items-start gap-4">
                    <span className="material-icons-outlined text-gray-600 dark:text-gray-400 w-6 flex-shrink-0 mt-2">
                      notifications
                    </span>
                    <div className="flex-1">
                      <ReminderPicker
                        reminders={reminders}
                        onChange={setReminders}
                      />
                    </div>
                  </div>

                  {/* Attendees */}
                  <div className="flex items-start gap-4">
                    <span className="material-icons-outlined text-gray-600 dark:text-gray-400 w-6 flex-shrink-0 mt-2">
                      people
                    </span>
                    <div className="flex-1">
                      <AttendeePicker
                        eventId={
                          event?.id ? event.id.toString().split("_")[0] : null
                        }
                        canEdit={true}
                        onChange={setAttendees}
                      />
                      {attendees.length > 0 && (
                        <label className="flex items-center gap-2 mt-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sendNotifications}
                            onChange={(e) =>
                              setSendNotifications(e.target.checked)
                            }
                            className="w-4 h-4 text-blue-600 dark:text-blue-500 border-gray-300 dark:border-gray-700 rounded focus:ring-blue-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Send email invitations to attendees
                          </span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex items-start gap-4">
                    <span className="material-icons-outlined text-gray-600 dark:text-gray-400 w-6 flex-shrink-0 mt-2">
                      subject
                    </span>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Add description"
                      className="input-field text-sm flex-1 resize-none bg-gray-50 dark:bg-[#2A2B2D] text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700 rounded"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#242526]">
            <div>
              {isEditing && (
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                  onClick={handleDelete}
                >
                  <span className="material-icons-outlined text-sm mr-1 align-middle">
                    delete
                  </span>
                  Delete
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-icons-outlined text-sm animate-spin">
                      refresh
                    </span>
                    Saving...
                  </>
                ) : (
                  <>{isEditing ? "Save" : "Create"}</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recurring Edit Dialog */}
      {showRecurringDialog && (
        <RecurringEditDialog
          isOpen={showRecurringDialog}
          onClose={() => setShowRecurringDialog(false)}
          onSelect={handleRecurringDialogSelect}
          eventTitle={formData.title}
        />
      )}
    </>
  );
}

export default EventModal;
