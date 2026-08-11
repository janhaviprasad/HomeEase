import { createContext, useState } from "react";

// The context object ships alongside its provider. Splitting it into its own
// module is the lint-clean answer but touches every consumer; deferred.
// eslint-disable-next-line react-refresh/only-export-components
export const AdminContext = createContext();

// Login writes these keys on a successful sign-in. Seeding from them here is
// what keeps the real admin on screen after a refresh — previously the
// provider started from placeholder literals and Sidebar worked around it by
// keeping a duplicate copy of the name.
const readStored = (key, fallback) =>
  localStorage.getItem(key) || fallback;

export const AdminProvider = ({ children }) => {

  const [adminName, setAdminName] = useState(
    // Falls back to a generic label rather than a blank sidebar if the key is
    // somehow missing. Every authenticated route has it.
    () => readStored("adminName", "Admin User")
  );

  const [adminEmail, setAdminEmail] = useState(
    () => readStored("adminEmail", "")
  );

  const [adminImage, setAdminImage] = useState(
    "https://i.pravatar.cc/150?img=12"
  );

  return (
    <AdminContext.Provider
      value={{
        adminName,
        setAdminName,

        adminEmail,
        setAdminEmail,

        adminImage,
        setAdminImage,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
