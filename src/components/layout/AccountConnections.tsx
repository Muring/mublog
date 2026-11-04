"use client";
import Script from "next/script";
import "../../../public/account-settings.css";
import { useEffect } from "react";
export default function AccountConnections() {
  useEffect(() => {
    window.dispatchEvent(new Event("accounts:mount"));
  }, []);
  return (
    <>
      <div className="account-settings" data-account-settings="" />
      <Script
        src="/account-settings.js"
        strategy="afterInteractive"
        onReady={() => {
          window.dispatchEvent(new Event("accounts:mount"));
        }}
      />
    </>
  );
}
