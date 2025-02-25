import { ReactNode } from "react";

interface PageTitleProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export const PageTitle = ({ title, subtitle, children }: PageTitleProps) => {
  return (
    <div className="space-y-1 mt-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {typeof subtitle === "string" && (
        <p className="text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
};
