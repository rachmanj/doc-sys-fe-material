export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">
              © {new Date().getFullYear()} ARKA - All rights reserved.
            </p>
          </div>
          <div className="text-sm">Dev by IT Dept</div>
        </div>
      </div>
    </footer>
  );
}
