import { SVGProps } from 'react';

export function PandaIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            {...props}
        >
            {/* Head circle */}
            <circle cx="12" cy="12" r="8" />

            {/* Left ear */}
            <circle cx="6" cy="6" r="2.5" fill="currentColor" />

            {/* Right ear */}
            <circle cx="18" cy="6" r="2.5" fill="currentColor" />

            {/* Left eye patch */}
            <ellipse cx="9" cy="11" rx="2" ry="2.5" fill="currentColor" />

            {/* Right eye patch */}
            <ellipse cx="15" cy="11" rx="2" ry="2.5" fill="currentColor" />

            {/* Left eye */}
            <circle cx="9" cy="11" r="0.75" fill="white" stroke="none" />

            {/* Right eye */}
            <circle cx="15" cy="11" r="0.75" fill="white" stroke="none" />

            {/* Nose */}
            <ellipse cx="12" cy="14.5" rx="1" ry="0.75" fill="currentColor" />

            {/* Mouth */}
            <path d="M10.5 16 C11 17, 13 17, 13.5 16" />
        </svg>
    );
}
