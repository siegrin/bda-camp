import type { SVGProps } from "react";

export function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      {...props}
    >
      <path
        d="M50 5 L95 95 H5 Z"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinejoin="round"
        fill="currentColor"
        className="text-primary/10"
      />
      <path
        d="M30 95 L50 55 L70 95"
        stroke="currentColor"
        className="text-primary"
        strokeWidth="4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M50 95 L60 75 L70 95"
        stroke="currentColor"
        className="text-primary"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
