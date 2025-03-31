import { FaUserCircle } from "react-icons/fa"; // For avatar
import { FaThumbsUp } from "react-icons/fa"; // For thumbs up

const ReviewCard = ({
  reviews = [
    {
      userName: "Michael R.",
      userCountry: "United States",
      rating: 8.5,
      reviewContent:
        "The hotel was in a perfect location for exploring the city. Staff was very helpful and the room was clean and comfortable.",
      stayDate: "October 2023",
      reviewDate: "November 2, 2023",
    },
    {
      userName: "Sophie L.",
      userCountry: "France",
      rating: 9.0,
      reviewContent:
        "Amazing experience! The view was breathtaking and the service was top-notch.",
      stayDate: "December 2023",
      reviewDate: "January 15, 2024",
    },
    {
      userName: "Akira T.",
      userCountry: "Japan",
      rating: 7.8,
      reviewContent:
        "Good stay overall, but the breakfast could be improved. Rooms were spacious.",
      stayDate: "February 2024",
      reviewDate: "March 1, 2024",
    },
  ],
}) => {
  return (
    <div className="space-y-4">
      {reviews.map((review, index) => {
        const stars = Math.round((review.rating / 10) * 5);

        return (
          <div
            key={index}
            className="overflow-hidden border-0 shadow-sm bg-white rounded-lg"
          >
            <div className="flex h-1.5 w-full bg-blue-500"></div>
            <div className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaUserCircle className="h-8 w-8 text-blue-500" />
                  <div>
                    <div className="text-sm font-medium">{review.userName}</div>
                    <div className="flex items-center text-xs text-gray-500">
                      <img
                        src="/placeholder.svg?height=16&width=24"
                        alt={`${review.userCountry} flag`}
                        className="mr-1 h-3 w-4"
                      />
                      {review.userCountry}
                    </div>
                  </div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                  {review.rating}
                </div>
              </div>

              <div className="mb-2 flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < stars ? "fill-blue-500" : "fill-gray-200"
                    }`}
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="mb-2 line-clamp-2 text-xs text-gray-500">
                {review.reviewContent}
              </p>

              <div className="mt-2 flex items-center justify-between">
                <span className="bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700 border border-blue-200 rounded">
                  Stayed: {review.stayDate}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <FaThumbsUp className="h-3 w-3" />
                  <span>Helpful</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReviewCard;