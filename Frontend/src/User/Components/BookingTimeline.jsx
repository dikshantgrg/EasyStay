import { FiCalendar } from 'react-icons/fi';

const BookingTimeline = ({ checkIn, checkOut }) => (
  <div className="bg-gray-50 p-4 rounded-lg mb-6">
    <h3 className="text-lg font-semibold mb-4 flex items-center">
      <FiCalendar className="mr-2" />
      Booking Dates
    </h3>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-gray-600">Check-in</p>
        <p className="font-medium">{checkIn}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Check-out</p>
        <p className="font-medium">{checkOut}</p>
      </div>
    </div>
  </div>
);

export default BookingTimeline;