import { createContext, useState } from "react";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {

  const [adminName, setAdminName] =
    useState("Admin User");

  const [adminEmail, setAdminEmail] =
    useState("admin@homeease.com");

    const [adminImage, setAdminImage] =
    useState("https://i.pravatar.cc/150?img=12");

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