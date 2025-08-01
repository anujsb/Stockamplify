// app/contact/page.tsx
import React from "react";

export default function ContactPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12 text-gray-300">
      <h1 className="text-3xl font-bold mb-4 text-white">Contact Us</h1>
      <p className="mb-4 text-base">
        Have questions, suggestions, or need support? We are here to help.
      </p>
      <p className="text-base">
        📧 Email us at:{" "}
        <a
          href="mailto:stockamplifyfeedback@gmail.com"
          className="text-blue-400 hover:underline"
        >
          stockamplifyfeedback@gmail.com
        </a>
      </p>
    </main>
  );
}
