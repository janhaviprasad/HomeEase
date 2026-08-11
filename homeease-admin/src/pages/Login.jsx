import { useState } from 'react'
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../services/authApi";
import {
  FaEnvelope,
  FaLock,
  FaArrowRight,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

function Login() {

    const navigate = useNavigate();

    const[email, setEmail] = useState("admin@homeease.com");
    const[password, setPassword] = useState("admin123");
    const[showPassword, setShowPassword] = useState(false);
    const[showTerms, setShowTerms] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await loginAdmin({
        email,
        password,
      });

    const user = response.data.data;
      console.log(user);
    localStorage.setItem(
      "token",
      user.token
    );

    localStorage.setItem(
      "adminName",
      user.name
    );

    localStorage.setItem(
      "adminEmail",
      user.email
    );

    localStorage.setItem(
      "role",
      user.role
    );

    alert("Login Successful");
    console.log("before dashboard");
    navigate("/dashboard");
  
  } catch (error) {

    alert(
      "Invalid Email or Password"
    );

    console.log(error);
  }
};




  return (
     <div
      className="
      min-h-screen
      bg-[#F5F3F4]
      flex
      justify-center
      items-center
      px-2"
    >
      <div
        className="
        bg-white
        border
        rounded-2xl
        shadow-sm
        w-full
        max-w-md
        p-5"
      >
        {/* Title */}

        <div className="text-center">

          <h1
            className="
            text-4xl
            font-bold
            font-serif"
          >
            HomeEase Admin
          </h1>

          <p
            className="
            mt-4
            text-gray-600
            text-lg"
          >
            Sign in to continue
          </p>

        </div>

        <form
          onSubmit={handleLogin}
          className="mt-10 space-y-6"
        >

          <div>

            <label
              className="
              font-semibold
              block
              mb-2"
            >
              Email Address
            </label>

            <div
              className="
              flex
              items-center
              border
              rounded-xl
              px-4
              py-4"
            >
              <FaEnvelope
                className="
                text-gray-500"
              />

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="
                ml-4
                w-full
                outline-none"
                placeholder="Email"
              />
            </div>

          </div>

          <div>

            <div className="mb-2">

              <label
                className="
                font-semibold"
              >
                Password
              </label>

            </div>

            <div
              className="
              flex
              items-center
              border
              rounded-xl
              px-4
              py-4"
            >
              <FaLock
                className="
                text-gray-500"
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                className="
                ml-4
                w-full
                outline-none"
                placeholder="Password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>

          </div>

          {/* Login */}

          <button
          
            type="submit"
            className="
            w-full
            bg-teal-700
            hover:bg-teal-800
            text-white
            py-4
            rounded-xl
            flex
            justify-center
            items-center
            gap-3
            text-lg
            font-semibold
            transition"
          >
            Sign In

            <FaArrowRight />

          </button>

        </form>

        {/* Footer */}

        <p className="
          text-center
          text-gray-500
          mt-8"
        >
          By signing in, you agree to our{" "}

          <span
            className="text-teal-700 cursor-pointer"
            onClick={()=> setShowTerms(true)}
          >
            Terms of Service
          </span>

        </p>

      </div>
      {showTerms && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg relative w-96">
            <button
                className="absolute top-2 right-3 text-xl"
                onClick={() => setShowTerms(false)}
            >
                ×
            </button>

            <h2 className="text-xl font-bold mb-4">
                Terms of Service
            </h2>

            <p>
                By using HomeEase Admin, you agree to comply
                with the application's policies and guidelines.
            </p>
        </div>
    </div>
)}
    </div>
  );
}

export default Login