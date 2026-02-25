import React from 'react';

export function Logo({ className = "" }: { className?: string }) {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <svg
                viewBox="0 0 100 100"
                className="w-full h-full drop-shadow-2xl"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* White Circle Background */}
                <circle cx="50" cy="50" r="48" fill="white" />
                <circle cx="50" cy="50" r="47.5" stroke="black" strokeWidth="0.5" strokeOpacity="0.2" />

                {/* Lawyer Bands (Stylized Icon) */}
                <path
                    d="M35 25L50 35L65 25V40L50 75L35 40V25Z"
                    fill="black"
                />
                <path
                    d="M50 35L35 25H65L50 35Z"
                    fill="black"
                />

                {/* Curved Text "ADVOCATE" */}
                <defs>
                    <path
                        id="textPath"
                        d="M 20,70 A 35,35 0 0,0 80,70"
                    />
                </defs>
                <text fill="black" fontSize="10" fontWeight="900" letterSpacing="2">
                    <textPath href="#textPath" startOffset="50%" textAnchor="middle">
                        ADVOCATE
                    </textPath>
                </text>
            </svg>
        </div>
    );
}
