import { useEffect, useMemo, useState } from "react";

function parseAppointmentDate(value) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toDateKey(date) {
  if (!date) return "";
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AppointmentCalendar({
  appointments,
  title = "Appointment Calendar",
  emptyText = "No appointments for the selected date.",
  getPrimaryText,
  getSecondaryText,
}) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDateKey, setSelectedDateKey] = useState(toDateKey(today));
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  const normalizedAppointments = useMemo(
    () =>
      appointments
        .map((appointment) => {
          const date = parseAppointmentDate(appointment.date);
          if (!date) return null;
          return {
            ...appointment,
            parsedDate: date,
            dateKey: toDateKey(date),
          };
        })
        .filter(Boolean),
    [appointments]
  );

  useEffect(() => {
    if (!normalizedAppointments.length) return;
    const hasSelectedDate = normalizedAppointments.some(
      (appointment) => appointment.dateKey === selectedDateKey
    );
    if (!hasSelectedDate) {
      setSelectedDateKey(normalizedAppointments[0].dateKey);
    }
  }, [normalizedAppointments, selectedDateKey]);

  const appointmentsByDate = useMemo(() => {
    const grouped = new Map();
    normalizedAppointments.forEach((appointment) => {
      if (!grouped.has(appointment.dateKey)) {
        grouped.set(appointment.dateKey, []);
      }
      grouped.get(appointment.dateKey).push(appointment);
    });
    return grouped;
  }, [normalizedAppointments]);

  const selectedAppointments = appointmentsByDate.get(selectedDateKey) || [];
  const selectedAppointment =
    selectedAppointments.find(
      (appointment) => appointment._id === selectedAppointmentId
    ) || selectedAppointments[0];

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  const startingDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const calendarDays = [];
  for (let index = 0; index < startingDay; index += 1) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    calendarDays.push(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <h4 style={{ margin: 0 }}>{title}</h4>
        <div style={styles.monthSwitcher}>
          <button
            style={styles.navButton}
            onClick={() =>
              setCurrentMonth(
                new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
              )
            }
          >
            ‹
          </button>
          <strong>
            {currentMonth.toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </strong>
          <button
            style={styles.navButton}
            onClick={() =>
              setCurrentMonth(
                new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
              )
            }
          >
            ›
          </button>
        </div>
      </div>

      <div style={styles.weekdays}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div style={styles.grid}>
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} style={styles.emptyCell}></div>;
          }

          const dateKey = toDateKey(date);
          const isSelected = dateKey === selectedDateKey;
          const hasAppointments = appointmentsByDate.has(dateKey);
          const isToday = dateKey === toDateKey(today);

          return (
            <button
              key={dateKey}
              style={{
                ...styles.dayCell,
                ...(isSelected ? styles.dayCellSelected : {}),
                ...(isToday ? styles.todayCell : {}),
              }}
              onClick={() => {
                setSelectedDateKey(dateKey);
                setSelectedAppointmentId(null);
              }}
            >
              <span>{date.getDate()}</span>
              {hasAppointments && <span style={styles.dot}></span>}
            </button>
          );
        })}
      </div>

      <div style={styles.detailsBox}>
        <div style={styles.detailsHeader}>
          <strong>
            {selectedDateKey
              ? new Date(`${selectedDateKey}T00:00:00`).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Select a date"}
          </strong>
        </div>

        {selectedAppointments.length > 0 ? (
          <>
            <div style={styles.timeList}>
              {selectedAppointments.map((appointment) => (
                <button
                  key={appointment._id}
                  style={{
                    ...styles.timeButton,
                    ...(selectedAppointment?._id === appointment._id
                      ? styles.timeButtonSelected
                      : {}),
                  }}
                  onClick={() => setSelectedAppointmentId(appointment._id)}
                >
                  {appointment.time}
                </button>
              ))}
            </div>

            {selectedAppointment && (
              <div style={styles.selectedCard}>
                <strong>{getPrimaryText(selectedAppointment)}</strong>
                <p style={styles.selectedText}>{getSecondaryText(selectedAppointment)}</p>
                <p style={styles.selectedText}>Status: {selectedAppointment.status}</p>
              </div>
            )}
          </>
        ) : (
          <p style={styles.emptyText}>{emptyText}</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "grid",
    gap: 16,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  monthSwitcher: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  navButton: {
    width: 30,
    height: 30,
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    background: "#fff",
    cursor: "pointer",
  },
  weekdays: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 8,
    color: "#64748b",
    fontSize: 12,
    textAlign: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 8,
  },
  emptyCell: {
    height: 42,
  },
  dayCell: {
    position: "relative",
    height: 42,
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    background: "#fff",
    cursor: "pointer",
    color: "#0f172a",
  },
  dayCellSelected: {
    background: "#2563eb",
    color: "#fff",
    borderColor: "#2563eb",
  },
  todayCell: {
    boxShadow: "inset 0 0 0 1px #93c5fd",
  },
  dot: {
    position: "absolute",
    bottom: 6,
    left: "50%",
    transform: "translateX(-50%)",
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "currentColor",
  },
  detailsBox: {
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 14,
    background: "#f8fafc",
  },
  detailsHeader: {
    marginBottom: 12,
  },
  timeList: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  timeButton: {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid #cbd5e1",
    background: "#fff",
    cursor: "pointer",
  },
  timeButtonSelected: {
    background: "#dbeafe",
    borderColor: "#60a5fa",
    color: "#1d4ed8",
  },
  selectedCard: {
    background: "#fff",
    borderRadius: 12,
    padding: 12,
    border: "1px solid #e2e8f0",
  },
  selectedText: {
    margin: "6px 0 0",
    color: "#475569",
    fontSize: 13,
  },
  emptyText: {
    margin: 0,
    color: "#64748b",
    fontSize: 13,
  },
};
