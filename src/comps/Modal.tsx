'use client';

import { useState } from "react";

export default function Modal({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <>{ isOpen &&
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg flex flex-col items-center justify-center">
                {children}
                <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setIsOpen(false)}>
                    Close
                </button>
            </div>
            
        </div>}
        </>
    )
}