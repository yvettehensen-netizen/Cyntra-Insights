import React from "react";

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0E0E0E] text-[#F8F5F2] p-6">
      <h1 className="text-4xl font-playfair mb-6 gold-shine">
        Neem contact op
      </h1>

      <form
        name="contact"
        method="POST"
        data-netlify="true"
        action="/bedankt"
        className="flex flex-col gap-4 w-full max-w-md bg-[#1A1A1A] p-6 rounded-2xl shadow-lg"
      >
        <input type="hidden" name="form-name" value="contact" />

        <label className="flex flex-col text-left">
          Naam
          <input
            type="text"
            name="name"
            required
            className="p-2 rounded bg-[#3B0E18] text-[#F8F5F2] mt-1"
          />
        </label>

        <label className="flex flex-col text-left">
          E-mail
          <input
            type="email"
            name="email"
            required
            className="p-2 rounded bg-[#3B0E18] text-[#F8F5F2] mt-1"
          />
        </label>

        <label className="flex flex-col text-left">
          Bericht
          <textarea
            name="message"
            rows={4}
            required
            className="p-2 rounded bg-[#3B0E18] text-[#F8F5F2] mt-1"
          ></textarea>
        </label>

        <button
          type="submit"
          className="bg-[#D6B48E] text-[#3B0E18] font-semibold py-2 rounded hover:bg-[#e9cba7] transition"
        >
          Verzenden
        </button>
      </form>

      <a
        href="/"
        className="mt-8 text-[#D6B48E] hover:text-[#e9cba7] underline transition"
      >
        Terug naar home
      </a>
    </div>
  );
}
