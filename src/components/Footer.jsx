export default function Footer() {
  return (
    <footer className="w-full py-6 bg-gray-100 border-t border-gray-300 mt-10">
      <div className="max-w-4xl mx-auto text-center text-gray-600 text-sm">
        <p className="font-medium">Sudoku Challenge</p>
        <p className="mt-1">
          © {new Date().getFullYear()} All rights reserved{" "}
          <a
            href="https://farrassyuja.my.id/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#2563eb", fontWeight: "bold" }}
          >
            Farras Syuja
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
