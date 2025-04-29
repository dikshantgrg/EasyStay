import { useState } from "react";
import img from "../../assets/karsten-winegeart-sStahKEhT9w-unsplash.jpg"
import Footer from "../Components/Footer";
import LoginModal from "../Components/LoginModal";
import SignupModal from "../Components/SignUPModal";
import { Link, useNavigate } from "react-router-dom";


const BecomeAHost = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("token") ? true : false;
  });
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  const handleStartHostingClick = () => {
    console.log("Button clicked");
    console.log(isLoggedIn);
    if (!isLoggedIn) {
      setIsLoginModalOpen(true); // Open login modal if user is not logged in
    } else {
      navigate("/hosting/form/become-a-host")
    }
  };

  const handleOpenSignupModal = () => {
    console.log("Opening signup modal");
    setIsSignupModalOpen(true); // Open signup modal
    setIsLoginModalOpen(false); // Ensure the login modal is closed when opening the signup modal
  };

  const handleCloseSignupModal = () => {
    console.log("Closing signup modal");
    setIsSignupModalOpen(false); // Close signup modal
  };

  const handleCloseLoginModal = () => {
    console.log("Closing login modal");
    setIsLoginModalOpen(false); // Close login modal
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <h1 className="text-5xl font-bold font-openSans text-gray-900 mb-6">
                Become a Host and Earn Money
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Share your space with travelers and start earning extra income.
                Join our community of hosts and reach millions of guests
                worldwide.
              </p>
              <button
                className="bg-blue-500 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-600"
                onClick={handleStartHostingClick}
              >
               
                
                Start Hosting Today
              
              </button>
            </div>
            <div className="lg:w-1/2">
              <img
                src={img}
                alt="Hosting illustration"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="py-20 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Host With Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{ title: "Easy Setup", description: "Get started in minutes with our simple onboarding process", icon: "🛠️" }, { title: "Secure Payments", description: "Receive payments securely and on time, every time", icon: "🔒" }, { title: "24/7 Support", description: "Access our dedicated support team whenever you need help", icon: "📞" }].map((feature, index) => (
              <div
                key={index}
                className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Become a Host?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of hosts already earning on our platform
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100">
            Get Started Now
          </button>
        </div>
      </div>
      {/* Footer */}
      <Footer />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal} // Close login modal
        openSignupModal={handleOpenSignupModal} // Corrected to call handleOpenSignupModal
      />
      
      {/* Signup Modal */}
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={handleCloseSignupModal} // Corrected to call handleCloseSignupModal
        openLoginModal={() => {
          console.log("Opening login modal from signup");
          setIsSignupModalOpen(false); // Close signup modal first
          setIsLoginModalOpen(true); // Open login modal
        }}
      />
    </div>
  );
};
export  default BecomeAHost;