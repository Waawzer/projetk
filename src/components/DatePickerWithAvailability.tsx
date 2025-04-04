"use client";

import DatePicker, { registerLocale } from "react-datepicker";
import { fr } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { FiCalendar } from "react-icons/fi";

// Enregistrer la locale française
registerLocale("fr", fr);

interface DatePickerWithAvailabilityProps {
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
  minDate?: Date;
}

const DatePickerWithAvailability: React.FC<DatePickerWithAvailabilityProps> = ({
  selectedDate,
  onDateChange,
  minDate = new Date(),
}) => {
  // Fonction pour gérer le changement de date avec log
  const handleDateChange = (date: Date) => {
    console.log(`Date sélectionnée: ${date.toLocaleString()}`);

    // Format ISO peut causer un décalage de jour selon le fuseau horaire
    console.log(`Format ISO (UTC): ${date.toISOString()}`);

    // Utilisation du format local pour éviter le décalage
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formattedLocalDate = `${year}-${month}-${day}`;
    console.log(`Format YYYY-MM-DD (local): ${formattedLocalDate}`);

    onDateChange(date);
  };

  return (
    <div className="w-full relative">
      <div className="relative">
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          locale="fr"
          dateFormat="dd/MM/yyyy"
          minDate={minDate}
          className="w-full px-3 py-2 rounded-lg bg-card-hover border border-gray-700 focus:border-primary focus:ring-primary"
          calendarClassName="bg-card text-white border border-gray-700 rounded-lg shadow-xl !font-sans"
          placeholderText="Sélectionnez une date"
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          popperProps={{
            strategy: "fixed",
          }}
          popperPlacement="bottom-start"
        />
        <FiCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );
};

export default DatePickerWithAvailability;
