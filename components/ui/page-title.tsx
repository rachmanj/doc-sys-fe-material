import { ReactNode } from "react";

interface PageTitleProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function PageTitle({ title, subtitle, children }: PageTitleProps) {
  return (
    <div className="flex justify-between items-center mb-6 mt-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      <div className="flex items-center space-x-4">{children}</div>
    </div>
  );
}
