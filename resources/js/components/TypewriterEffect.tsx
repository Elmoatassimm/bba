import React, { useState, useEffect, useRef } from 'react';

interface TypewriterEffectProps {
    text: string;
    typingSpeed?: number;
    startDelay?: number;
    onComplete?: () => void;
    className?: string;
}

export default function TypewriterEffect({
    text,
    typingSpeed = 10, // milliseconds per character
    startDelay = 500, // milliseconds before starting
    onComplete,
    className = '',
}: TypewriterEffectProps) {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentIndexRef = useRef(0);

    useEffect(() => {
        // Reset state when text changes
        setDisplayedText('');
        setIsComplete(false);
        currentIndexRef.current = 0;
        
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Start typing after the delay
        const delayTimeout = setTimeout(() => {
            typeNextCharacter();
        }, startDelay);

        return () => {
            clearTimeout(delayTimeout);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [text]);

    const typeNextCharacter = () => {
        if (currentIndexRef.current < text.length) {
            setDisplayedText(prev => prev + text[currentIndexRef.current]);
            currentIndexRef.current++;
            
            timeoutRef.current = setTimeout(typeNextCharacter, typingSpeed);
        } else {
            setIsComplete(true);
            if (onComplete) {
                onComplete();
            }
        }
    };

    return (
        <div className={`whitespace-pre-line ${className}`}>
            {displayedText}
            {!isComplete && <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse"></span>}
        </div>
    );
}
