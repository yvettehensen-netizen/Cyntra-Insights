// src/academy/components/AcademyFooter.tsx
export default function AcademyFooter() {
  return (
    <footer className="text-center py-6 border-t mt-10 text-sm text-gray-500">
      © {new Date().getFullYear()} Cyntra Academy. All rights reserved.
    </footer>
  );
}
