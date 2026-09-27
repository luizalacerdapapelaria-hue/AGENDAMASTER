import React from 'react';
import { BaseElementProps } from './types';
import { FooterTrackerConfig, FooterTrackerType, FooterTrackerSection } from '../../../../types';

// SVGs for Water Tracker
const GlassIcon: React.FC<{ stroke: string; fill: string; strokeWidth: number; className?: string }> = ({
    stroke,
    fill,
    strokeWidth,
    className = ''
}) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
        {/* Glass body */}
        <path
            d="M5.5 3h13l-1.6 15.5a2.5 2.5 0 0 1-2.48 2.25H9.58a2.5 2.5 0 0 1-2.48-2.25L5.5 3Z"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={fill}
        />
        {/* Rim top line */}
        <line x1="5" y1="3" x2="19" y2="3" stroke={stroke} strokeWidth={strokeWidth * 1.1} strokeLinecap="round" />
        {/* Water fill guideline */}
        <path
            d="M7 10c1.6.8 3.2-.8 5 0s3.4.8 5 0"
            stroke={stroke}
            strokeWidth={Math.max(0.7, strokeWidth * 0.75)}
            strokeDasharray="2 2"
            opacity={0.6}
            strokeLinecap="round"
        />
    </svg>
);

const BottleIcon: React.FC<{ stroke: string; fill: string; strokeWidth: number; className?: string }> = ({
    stroke,
    fill,
    strokeWidth,
    className = ''
}) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
        {/* Bottle Cap */}
        <rect x="9" y="1.5" width="6" height="3" rx="1" stroke={stroke} strokeWidth={strokeWidth} fill={stroke} />
        {/* Cap handle */}
        <path d="M10 1.5V1a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v.5" stroke={stroke} strokeWidth={Math.max(0.8, strokeWidth * 0.8)} />
        {/* Bottle Body */}
        <path
            d="M9.5 4.5h5v2a2 2 0 0 0 .6 1.4l1.2 1.2a2 2 0 0 1 .6 1.4v10a2.5 2.5 0 0 1-2.5 2.5h-4.8A2.5 2.5 0 0 1 7.1 20.5v-10a2 2 0 0 1 .6-1.4l1.2-1.2a2 2 0 0 0 .6-1.4v-2Z"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={fill}
        />
        {/* Water Measurement Lines */}
        <line x1="10" y1="13" x2="14" y2="13" stroke={stroke} strokeWidth={strokeWidth * 0.75} opacity={0.6} strokeLinecap="round" />
        <line x1="10" y1="16.5" x2="14" y2="16.5" stroke={stroke} strokeWidth={strokeWidth * 0.75} opacity={0.6} strokeLinecap="round" />
    </svg>
);

const DropIcon: React.FC<{ stroke: string; fill: string; strokeWidth: number; className?: string }> = ({
    stroke,
    fill,
    strokeWidth,
    className = ''
}) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
        <path
            d="M12 2.5 C12 2.5 5 11 5 15.5 A7 7 0 0 0 19 15.5 C19 11 12 2.5 12 2.5 Z"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={fill}
        />
        {/* Droplet shine */}
        <path
            d="M9 13.5 a4 4 0 0 0 3 4"
            stroke={stroke}
            strokeWidth={Math.max(0.7, strokeWidth * 0.75)}
            strokeLinecap="round"
            opacity={0.5}
        />
    </svg>
);

const MugIcon: React.FC<{ stroke: string; fill: string; strokeWidth: number; className?: string }> = ({
    stroke,
    fill,
    strokeWidth,
    className = ''
}) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
        <path
            d="M4 7h12v9a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V7Z"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={fill}
        />
        <path
            d="M16 9h2a3 3 0 0 1 0 6h-2"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        {/* Steam */}
        <path d="M7 4c0-1 1-1.5 1-2.5" stroke={stroke} strokeWidth={Math.max(0.7, strokeWidth * 0.75)} strokeLinecap="round" />
        <path d="M10 4c0-1 1-1.5 1-2.5" stroke={stroke} strokeWidth={Math.max(0.7, strokeWidth * 0.75)} strokeLinecap="round" />
        <path d="M13 4c0-1 1-1.5 1-2.5" stroke={stroke} strokeWidth={Math.max(0.7, strokeWidth * 0.75)} strokeLinecap="round" />
    </svg>
);

// Mood Faces SVGs (5 distinct gradations)
const MoodFaceIcon: React.FC<{
    level: 0 | 1 | 2 | 3 | 4;
    stroke: string;
    fill: string;
    strokeWidth: number;
    variant?: string;
    className?: string;
}> = ({ level, stroke, fill, strokeWidth, variant = 'faces_clean', className = '' }) => {
    // 0: Muito Feliz / Radiante
    // 1: Feliz / Bem
    // 2: Neutro / Normal
    // 3: Triste / Chateado
    // 4: Bravo / Estressado / Exausto

    const isCute = variant === 'faces_cute';

    const renderEyes = () => {
        if (level === 0) {
            // Radiante: Arched happy smiling eyes ^^
            return (
                <>
                    <path d="M7.5 10c.6-1.2 2-1.2 2.6 0" stroke={stroke} strokeWidth={strokeWidth * 1.1} strokeLinecap="round" />
                    <path d="M13.9 10c.6-1.2 2-1.2 2.6 0" stroke={stroke} strokeWidth={strokeWidth * 1.1} strokeLinecap="round" />
                </>
            );
        }
        if (level === 1) {
            // Feliz: Dot eyes
            return (
                <>
                    <circle cx="8.5" cy="9.5" r={isCute ? 1.4 : 1.2} fill={stroke} />
                    <circle cx="15.5" cy="9.5" r={isCute ? 1.4 : 1.2} fill={stroke} />
                </>
            );
        }
        if (level === 2) {
            // Neutro: Normal dots
            return (
                <>
                    <circle cx="8.5" cy="10" r={isCute ? 1.4 : 1.2} fill={stroke} />
                    <circle cx="15.5" cy="10" r={isCute ? 1.4 : 1.2} fill={stroke} />
                </>
            );
        }
        if (level === 3) {
            // Triste: Downward droopy eyes or small dots
            return (
                <>
                    <circle cx="8.5" cy="10.5" r={isCute ? 1.4 : 1.2} fill={stroke} />
                    <circle cx="15.5" cy="10.5" r={isCute ? 1.4 : 1.2} fill={stroke} />
                </>
            );
        }
        // level 4: Estressado / Bravo: angled slanted brows and eyes
        return (
            <>
                <line x1="7.2" y1="8.5" x2="10.2" y2="10" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
                <line x1="16.8" y1="8.5" x2="13.8" y2="10" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
                <circle cx="8.8" cy="10.8" r="1.1" fill={stroke} />
                <circle cx="15.2" cy="10.8" r="1.1" fill={stroke} />
            </>
        );
    };

    const renderMouth = () => {
        if (level === 0) {
            // Big open happy smile
            return (
                <path
                    d="M8 13.5c1 2.8 7 2.8 8 0"
                    stroke={stroke}
                    strokeWidth={strokeWidth * 1.1}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            );
        }
        if (level === 1) {
            // Gentle pleasant smile
            return (
                <path
                    d="M8.5 13.8c1.3 1.8 5.7 1.8 7 0"
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />
            );
        }
        if (level === 2) {
            // Straight neutral line
            return (
                <line
                    x1="8.8"
                    y1="14.5"
                    x2="15.2"
                    y2="14.5"
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />
            );
        }
        if (level === 3) {
            // Downward sad curve
            return (
                <path
                    d="M8.5 15.5c1.4-1.8 5.6-1.8 7 0"
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />
            );
        }
        // level 4: Wavy stressed / angry mouth
        return (
            <path
                d="M8.2 15.5l2.2-1.2 2.2 1.2 3.2-1.2"
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        );
    };

    return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
            {/* Outer Head Circle */}
            <circle
                cx="12"
                cy="12"
                r="9.5"
                stroke={stroke}
                strokeWidth={strokeWidth}
                fill={fill}
            />
            {/* Cute cheeks */}
            {isCute && (level === 0 || level === 1) && (
                <>
                    <ellipse cx="6.5" cy="12.5" rx="1.5" ry="0.9" fill={stroke} opacity={0.25} />
                    <ellipse cx="17.5" cy="12.5" rx="1.5" ry="0.9" fill={stroke} opacity={0.25} />
                </>
            )}
            {renderEyes()}
            {renderMouth()}
        </svg>
    );
};

// Star Icon for Star Ratings
const StarRatingIcon: React.FC<{
    stroke: string;
    fill: string;
    strokeWidth: number;
    className?: string;
}> = ({ stroke, fill, strokeWidth, className = '' }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
        <polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={fill}
        />
    </svg>
);

// Heart Icon for Heart Ratings
const HeartRatingIcon: React.FC<{
    stroke: string;
    fill: string;
    strokeWidth: number;
    className?: string;
}> = ({ stroke, fill, strokeWidth, className = '' }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
        <path
            d="M19.5 12.572l-7.5 7.428-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 1 1 7.5 6.566z"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={fill}
        />
    </svg>
);

// Weather Icons (5 types)
const WeatherIcon: React.FC<{
    typeIndex: 0 | 1 | 2 | 3 | 4;
    stroke: string;
    fill: string;
    strokeWidth: number;
    className?: string;
}> = ({ typeIndex, stroke, fill, strokeWidth, className = '' }) => {
    // 0: Sol (Ensolarado)
    // 1: Sol entre nuvens (Parcialmente nublado)
    // 2: Nuvem (Nublado)
    // 3: Chuva (Chuvoso)
    // 4: Tempestade (Raio/Trovão)

    if (typeIndex === 0) {
        // Ensolarado: Sol radiante
        return (
            <svg viewBox="0 0 24 24" className={className} fill="none">
                <circle cx="12" cy="12" r="4.5" stroke={stroke} strokeWidth={strokeWidth} fill={fill} />
                <line x1="12" y1="2" x2="12" y2="4.5" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
                <line x1="12" y1="19.5" x2="12" y2="22" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
                <line x1="2" y1="12" x2="4.5" y2="12" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
                <line x1="19.5" y1="12" x2="22" y2="12" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
                <line x1="4.93" y1="4.93" x2="6.7" y2="6.7" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
                <line x1="17.3" y1="17.3" x2="19.07" y2="19.07" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
                <line x1="4.93" y1="19.07" x2="6.7" y2="17.3" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
                <line x1="17.3" y1="6.7" x2="19.07" y2="4.93" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
            </svg>
        );
    }

    if (typeIndex === 1) {
        // Sol c/ nuvem
        return (
            <svg viewBox="0 0 24 24" className={className} fill="none">
                <path d="M12 4a4.5 4.5 0 0 1 4.5 4.5c0 .3 0 .7-.1 1" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
                <line x1="12" y1="1" x2="12" y2="2.5" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
                <line x1="17" y1="3.5" x2="18.2" y2="2.3" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
                <line x1="19" y1="8.5" x2="20.5" y2="8.5" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
                <path
                    d="M6 18.5a4 4 0 0 1-.3-8 4.5 4.5 0 0 1 8.6-1.5 3.5 3.5 0 0 1 3.2 4.5 3 3 0 0 1-1.5 5Z"
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill={fill}
                />
            </svg>
        );
    }

    if (typeIndex === 2) {
        // Nuvem
        return (
            <svg viewBox="0 0 24 24" className={className} fill="none">
                <path
                    d="M17.5 19H6.5A5.5 5.5 0 0 1 5.6 8.1 6.5 6.5 0 0 1 17.7 7.4 4.5 4.5 0 0 1 17.5 19Z"
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill={fill}
                />
            </svg>
        );
    }

    if (typeIndex === 3) {
        // Chuva
        return (
            <svg viewBox="0 0 24 24" className={className} fill="none">
                <path
                    d="M17 15H7a4.5 4.5 0 0 1-.7-8.9 5.5 5.5 0 0 1 10.4-.6 3.5 3.5 0 0 1 .3 9.5Z"
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill={fill}
                />
                <line x1="8" y1="18" x2="7" y2="21" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
                <line x1="12" y1="18" x2="11" y2="21" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
                <line x1="16" y1="18" x2="15" y2="21" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
            </svg>
        );
    }

    // Tempestade / Raio
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
            <path
                d="M17.5 14H6.8A4.5 4.5 0 0 1 6 5.1 5.5 5.5 0 0 1 16.5 4.7 4 4 0 0 1 17.5 14Z"
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={fill}
            />
            <polyline points="13 14 10 18 13.5 18 11.5 22.5" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill={stroke} />
        </svg>
    );
};

// Meals Icons (Café, Almoço, Jantar, Lanches)
const MealIcon: React.FC<{
    mealIndex: 0 | 1 | 2 | 3;
    stroke: string;
    fill: string;
    strokeWidth: number;
    className?: string;
}> = ({ mealIndex, stroke, fill, strokeWidth, className = '' }) => {
    // 0: Café da Manhã (Xícara)
    // 1: Almoço (Prato com talheres)
    // 2: Jantar (Prato com lua/noite)
    // 3: Lanches (Maçã / Fruta)

    if (mealIndex === 0) {
        return (
            <svg viewBox="0 0 24 24" className={className} fill="none">
                <path d="M5 8h11v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Z" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill={fill} />
                <path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 20h15" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
                <path d="M8 5c0-1 .8-1.5.8-2.5" stroke={stroke} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
                <path d="M11 5c0-1 .8-1.5.8-2.5" stroke={stroke} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
            </svg>
        );
    }
    if (mealIndex === 1) {
        // Almoço: Prato + Garfo + Faca
        return (
            <svg viewBox="0 0 24 24" className={className} fill="none">
                <circle cx="12" cy="12" r="6" stroke={stroke} strokeWidth={strokeWidth} fill={fill} />
                <circle cx="12" cy="12" r="3.5" stroke={stroke} strokeWidth={strokeWidth * 0.75} strokeDasharray="1.5 1.5" opacity={0.6} />
                <path d="M4 6v5a1.5 1.5 0 0 0 3 0V6M5.5 11v7" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 6v12M17.5 6c1.5 0 2.5 1.5 2.5 4v2h-2.5" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    }
    if (mealIndex === 2) {
        // Jantar: Prato + Lua crescente
        return (
            <svg viewBox="0 0 24 24" className={className} fill="none">
                <circle cx="11.5" cy="12" r="6.5" stroke={stroke} strokeWidth={strokeWidth} fill={fill} />
                <path d="M18.5 4.5a3.5 3.5 0 1 0 4.5 4.5 4 4 0 0 1-4.5-4.5Z" stroke={stroke} strokeWidth={strokeWidth * 0.9} fill={stroke} />
                <path d="M8 12h7" stroke={stroke} strokeWidth={strokeWidth * 0.8} strokeDasharray="1.5 1.5" opacity={0.6} />
            </svg>
        );
    }
    // Lanches: Maçã fofa
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
            <path
                d="M12 5.5c-2.5-3-7-1.5-7 3.5 0 5 4 9 7 11 3-2 7-6 7-11 0-5-4.5-6.5-7-3.5Z"
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={fill}
            />
            {/* Apple stem & small leaf */}
            <path d="M12 5.5V2" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
            <path d="M12 3c1.5-1.5 3.5-.5 3.5 1s-1.5 1.5-3.5-.5Z" stroke={stroke} strokeWidth={strokeWidth * 0.8} fill={fill} />
        </svg>
    );
};

// Sleep / Sono Icons & Elements
const SleepMoonIcon: React.FC<{ stroke: string; fill: string; strokeWidth: number; className?: string }> = ({
    stroke,
    fill,
    strokeWidth,
    className = ''
}) => (
    <svg viewBox="0 0 24 24" className={className} fill="none">
        <path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={fill}
        />
        {/* Little star */}
        <polygon
            points="18 5 18.8 6.8 20.8 7.1 19.3 8.5 19.7 10.5 18 9.5 16.3 10.5 16.7 8.5 15.2 7.1 17.2 6.8 18 5"
            stroke={stroke}
            strokeWidth={strokeWidth * 0.75}
            fill={stroke}
        />
    </svg>
);

const BatteryBlockIcon: React.FC<{
    level: number;
    stroke: string;
    fill: string;
    strokeWidth: number;
    className?: string;
}> = ({ level, stroke, fill, strokeWidth, className = '' }) => (
    <svg viewBox="0 0 24 16" className={className} fill="none">
        <rect x="1" y="2" width="19" height="12" rx="3" stroke={stroke} strokeWidth={strokeWidth} fill={fill} />
        <path d="M22 6.5v3" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
        {/* Interior level indicator tick */}
        <text
            x="10.5"
            y="9.8"
            textAnchor="middle"
            fill={stroke}
            fontSize="5.5"
            fontWeight="bold"
            fontFamily="Inter, sans-serif"
        >
            {level}%
        </text>
    </svg>
);

// Meds / Vitaminas (Pílulas & Comprimidos)
const PillIcon: React.FC<{
    isRound?: boolean;
    stroke: string;
    fill: string;
    strokeWidth: number;
    className?: string;
}> = ({ isRound, stroke, fill, strokeWidth, className = '' }) => {
    if (isRound) {
        return (
            <svg viewBox="0 0 24 24" className={className} fill="none">
                <circle cx="12" cy="12" r="8.5" stroke={stroke} strokeWidth={strokeWidth} fill={fill} />
                <line x1="5.5" y1="12" x2="18.5" y2="12" stroke={stroke} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
            </svg>
        );
    }
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
            <rect
                x="5"
                y="8"
                width="14"
                height="8"
                rx="4"
                transform="rotate(-35 12 12)"
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={fill}
            />
            <line
                x1="12"
                y1="5.5"
                x2="12"
                y2="18.5"
                transform="rotate(-35 12 12)"
                stroke={stroke}
                strokeWidth={strokeWidth * 0.85}
            />
        </svg>
    );
};

// Fitness / Treino (4 ícones)
const FitnessIcon: React.FC<{
    fitIndex: 0 | 1 | 2 | 3;
    stroke: string;
    fill: string;
    strokeWidth: number;
    className?: string;
}> = ({ fitIndex, stroke, fill, strokeWidth, className = '' }) => {
    // 0: Tênis (Passos/Caminhada)
    // 1: Haltere (Musculação)
    // 2: Chama (Calorias/Atividade)
    // 3: Batimento Cardíaco (Cardio/Saúde)

    if (fitIndex === 0) {
        // Tênis
        return (
            <svg viewBox="0 0 24 24" className={className} fill="none">
                <path
                    d="M3 15.5c2 0 4 .5 6-1l3-3 2.5 1.5a2 2 0 0 1 1 1.7v1.8h5a1 1 0 0 1 1 1v1a1.5 1.5 0 0 1-1.5 1.5H3.5A1.5 1.5 0 0 1 2 17v-.5a1 1 0 0 1 1-1Z"
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill={fill}
                />
                <line x1="8" y1="13" x2="10" y2="15" stroke={stroke} strokeWidth={strokeWidth * 0.8} />
                <line x1="10.5" y1="12" x2="12" y2="14" stroke={stroke} strokeWidth={strokeWidth * 0.8} />
            </svg>
        );
    }
    if (fitIndex === 1) {
        // Haltere
        return (
            <svg viewBox="0 0 24 24" className={className} fill="none">
                <rect x="2" y="8" width="3" height="8" rx="1.5" stroke={stroke} strokeWidth={strokeWidth} fill={fill} />
                <rect x="5" y="9.5" width="2" height="5" rx="1" stroke={stroke} strokeWidth={strokeWidth} fill={stroke} />
                <line x1="7" y1="12" x2="17" y2="12" stroke={stroke} strokeWidth={strokeWidth * 1.3} strokeLinecap="round" />
                <rect x="17" y="9.5" width="2" height="5" rx="1" stroke={stroke} strokeWidth={strokeWidth} fill={stroke} />
                <rect x="19" y="8" width="3" height="8" rx="1.5" stroke={stroke} strokeWidth={strokeWidth} fill={fill} />
            </svg>
        );
    }
    if (fitIndex === 2) {
        // Chama
        return (
            <svg viewBox="0 0 24 24" className={className} fill="none">
                <path
                    d="M12 2c0 3.5-3 5.5-3 9a6 6 0 0 0 12 0c0-4-3-6-3-9-1.5 2-2 3.5-3 4-1-2.5-3-4-3-4Z"
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill={fill}
                />
            </svg>
        );
    }
    // Batimento
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
            <path
                d="M19.5 12.572l-7.5 7.428-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 1 1 7.5 6.566z"
                stroke={stroke}
                strokeWidth={strokeWidth}
                fill={fill}
            />
            <path d="M4.5 12.5h3l1.8-3 2.4 6 1.8-3h4" stroke={stroke} strokeWidth={strokeWidth * 0.9} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

export const DEFAULT_COMPOSITE_SECTIONS: FooterTrackerSection[] = [
    { id: 'sec_water', type: 'water', enabled: true, label: 'Água', showLabel: true, iconVariant: 'glass', itemCount: 8 },
    { id: 'sec_mood', type: 'mood', enabled: true, label: 'Humor', showLabel: true, iconVariant: 'faces_clean', itemCount: 5 },
    { id: 'sec_weather', type: 'weather', enabled: false, label: 'Clima', showLabel: true, iconVariant: 'weather_5', itemCount: 5 },
    { id: 'sec_meals', type: 'meals', enabled: false, label: 'Refeições', showLabel: true, iconVariant: 'meals_4', itemCount: 4 },
    { id: 'sec_sleep', type: 'sleep', enabled: false, label: 'Sono', showLabel: true, iconVariant: 'sleep_hours', itemCount: 5 },
    { id: 'sec_meds', type: 'meds', enabled: false, label: 'Vitaminas', showLabel: true, iconVariant: 'pills', itemCount: 4 },
    { id: 'sec_gratitude', type: 'gratitude', enabled: false, label: 'Gratidão', showLabel: true, iconVariant: 'gratitude_line', itemCount: 1 },
    { id: 'sec_fitness', type: 'fitness', enabled: false, label: 'Treino', showLabel: true, iconVariant: 'fitness_4', itemCount: 4 },
];

export const FooterTrackerElement: React.FC<BaseElementProps> = ({ element, style, pageHeight, pageWidth }) => {
    const config: FooterTrackerConfig = style.footerTracker || {
        mode: 'single',
        trackerType: 'water',
        iconVariant: 'glass',
        itemCount: 8,
        itemSize: 20,
        spacing: 5,
        strokeColor: style.color || '#2563eb',
        fillColor: style.backgroundColor || 'transparent',
        strokeWidth: style.borderWidth ?? 1.2,
        showLabel: true,
        label: 'Água',
        labelPosition: 'left',
        showBox: false
    };

    const strokeColor = config.strokeColor || style.color || '#374151';
    const fillColor = config.fillColor || style.backgroundColor || 'transparent';
    const strokeWidth = typeof config.strokeWidth === 'number' ? config.strokeWidth : (style.borderWidth ?? 1.2);
    const itemSize = config.itemSize || 20;
    const spacing = config.spacing !== undefined ? config.spacing : 5;
    const fontFamily = style.fontFamily || 'Inter';
    const fontSize = style.fontSize || 10;
    const fontWeight = style.fontWeight || '600';
    const textColor = style.color || strokeColor;

    const defaultLabels: Record<FooterTrackerType, string> = {
        water: 'Água',
        mood: 'Humor',
        weather: 'Clima',
        meals: 'Refeições',
        sleep: 'Sono',
        meds: 'Vitaminas',
        gratitude: 'Gratidão',
        fitness: 'Treino'
    };

    const renderSectionItems = (
        type: FooterTrackerType,
        variant: string,
        count: number,
        customLabels?: string[],
        showItemLabels?: boolean
    ) => {
        if (type === 'water') {
            return Array.from({ length: count }).map((_, idx) => {
                let IconComp = GlassIcon;
                if (variant === 'bottle') IconComp = BottleIcon;
                else if (variant === 'drop') IconComp = DropIcon;
                else if (variant === 'mug') IconComp = MugIcon;

                return (
                    <div
                        key={idx}
                        className="shrink-0 flex items-center justify-center transition-transform hover:scale-110"
                        style={{ width: itemSize, height: itemSize }}
                        title={`Copo ${idx + 1}`}
                    >
                        <IconComp
                            stroke={strokeColor}
                            fill={fillColor}
                            strokeWidth={strokeWidth}
                            className="w-full h-full"
                        />
                    </div>
                );
            });
        }

        if (type === 'mood') {
            if (variant === 'stars') {
                return Array.from({ length: count }).map((_, idx) => (
                    <div
                        key={idx}
                        className="shrink-0 flex items-center justify-center transition-transform hover:scale-110"
                        style={{ width: itemSize, height: itemSize }}
                        title={`${idx + 1} estrela(s)`}
                    >
                        <StarRatingIcon
                            stroke={strokeColor}
                            fill={fillColor}
                            strokeWidth={strokeWidth}
                            className="w-full h-full"
                        />
                    </div>
                ));
            }

            if (variant === 'hearts') {
                return Array.from({ length: count }).map((_, idx) => (
                    <div
                        key={idx}
                        className="shrink-0 flex items-center justify-center transition-transform hover:scale-110"
                        style={{ width: itemSize, height: itemSize }}
                        title={`${idx + 1} coração(ões)`}
                    >
                        <HeartRatingIcon
                            stroke={strokeColor}
                            fill={fillColor}
                            strokeWidth={strokeWidth}
                            className="w-full h-full"
                        />
                    </div>
                ));
            }

            const moodNames = ['Radiante', 'Bem', 'Neutro', 'Desanimado', 'Estressado'];
            return Array.from({ length: count }).map((_, idx) => {
                const level = (idx % 5) as 0 | 1 | 2 | 3 | 4;
                return (
                    <div
                        key={idx}
                        className="shrink-0 flex flex-col items-center justify-center transition-transform hover:scale-110"
                        style={{ width: itemSize, height: itemSize }}
                        title={moodNames[level]}
                    >
                        <MoodFaceIcon
                            level={level}
                            variant={variant}
                            stroke={strokeColor}
                            fill={fillColor}
                            strokeWidth={strokeWidth}
                            className="w-full h-full"
                        />
                    </div>
                );
            });
        }

        if (type === 'weather') {
            const weatherNames = ['Ensolarado', 'Parcialmente Nublado', 'Nublado', 'Chuvoso', 'Tempestade'];
            return Array.from({ length: count }).map((_, idx) => {
                const typeIndex = (idx % 5) as 0 | 1 | 2 | 3 | 4;
                return (
                    <div
                        key={idx}
                        className="shrink-0 flex items-center justify-center transition-transform hover:scale-110"
                        style={{ width: itemSize, height: itemSize }}
                        title={weatherNames[typeIndex]}
                    >
                        <WeatherIcon
                            typeIndex={typeIndex}
                            stroke={strokeColor}
                            fill={fillColor}
                            strokeWidth={strokeWidth}
                            className="w-full h-full"
                        />
                    </div>
                );
            });
        }

        if (type === 'meals') {
            const mealNames = ['Café da Manhã', 'Almoço', 'Jantar', 'Lanches'];
            const mealShorts = ['C', 'A', 'J', 'L'];
            const showText = showItemLabels !== false;

            return Array.from({ length: count }).map((_, idx) => {
                const mealIndex = (idx % 4) as 0 | 1 | 2 | 3;
                return (
                    <div
                        key={idx}
                        className="shrink-0 flex flex-col items-center justify-center gap-0.5"
                        style={{ width: Math.max(itemSize, 18) }}
                        title={mealNames[mealIndex]}
                    >
                        <div style={{ width: itemSize, height: itemSize }}>
                            <MealIcon
                                mealIndex={mealIndex}
                                stroke={strokeColor}
                                fill={fillColor}
                                strokeWidth={strokeWidth}
                                className="w-full h-full"
                            />
                        </div>
                        {showText && (
                            <span
                                style={{
                                    fontSize: Math.max(7, fontSize * 0.75),
                                    color: textColor,
                                    fontFamily,
                                    fontWeight: 'bold',
                                    lineHeight: 1
                                }}
                            >
                                {customLabels?.[idx] || mealShorts[mealIndex]}
                            </span>
                        )}
                    </div>
                );
            });
        }

        if (type === 'sleep') {
            if (variant === 'battery') {
                const batteryLevels = [20, 40, 60, 80, 100];
                return Array.from({ length: count }).map((_, idx) => (
                    <div
                        key={idx}
                        className="shrink-0 flex items-center justify-center"
                        style={{ width: itemSize * 1.2, height: itemSize * 0.8 }}
                        title={`Energia ${batteryLevels[idx % 5]}%`}
                    >
                        <BatteryBlockIcon
                            level={batteryLevels[idx % 5]}
                            stroke={strokeColor}
                            fill={fillColor}
                            strokeWidth={strokeWidth}
                            className="w-full h-full"
                        />
                    </div>
                ));
            }

            const defaultHours = ['5h', '6h', '7h', '8h', '9h+'];
            return (
                <div className="flex items-center gap-1.5">
                    <div style={{ width: itemSize, height: itemSize }} className="shrink-0">
                        <SleepMoonIcon
                            stroke={strokeColor}
                            fill={fillColor}
                            strokeWidth={strokeWidth}
                            className="w-full h-full"
                        />
                    </div>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: count }).map((_, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-center rounded-full shrink-0"
                                style={{
                                    width: Math.max(14, itemSize * 0.8),
                                    height: Math.max(14, itemSize * 0.8),
                                    border: `${strokeWidth}px solid ${strokeColor}`,
                                    backgroundColor: fillColor,
                                    fontSize: Math.max(7, fontSize * 0.72),
                                    color: textColor,
                                    fontFamily,
                                    fontWeight: 'bold'
                                }}
                                title={`${defaultHours[idx % defaultHours.length]} de sono`}
                            >
                                {customLabels?.[idx] || defaultHours[idx % defaultHours.length]}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (type === 'meds') {
            return Array.from({ length: count }).map((_, idx) => {
                const isRound = idx % 2 === 1;
                return (
                    <div
                        key={idx}
                        className="shrink-0 flex items-center justify-center"
                        style={{ width: itemSize, height: itemSize }}
                        title={`Dose ${idx + 1}`}
                    >
                        <PillIcon
                            isRound={isRound}
                            stroke={strokeColor}
                            fill={fillColor}
                            strokeWidth={strokeWidth}
                            className="w-full h-full"
                        />
                    </div>
                );
            });
        }

        if (type === 'gratitude') {
            return (
                <div className="flex-1 flex items-center gap-2 min-w-[80px]">
                    <div style={{ width: itemSize, height: itemSize }} className="shrink-0">
                        <HeartRatingIcon
                            stroke={strokeColor}
                            fill={fillColor}
                            strokeWidth={strokeWidth}
                            className="w-full h-full"
                        />
                    </div>
                    <div
                        className="flex-1 h-0"
                        style={{
                            borderBottom: `${strokeWidth || 1}px ${config.lineStyle || 'dashed'} ${strokeColor}`,
                            opacity: 0.8
                        }}
                    />
                </div>
            );
        }

        if (type === 'fitness') {
            const fitNames = ['Passos', 'Musculação', 'Queima', 'Cardio'];
            return Array.from({ length: count }).map((_, idx) => {
                const fitIndex = (idx % 4) as 0 | 1 | 2 | 3;
                return (
                    <div
                        key={idx}
                        className="shrink-0 flex items-center justify-center"
                        style={{ width: itemSize, height: itemSize }}
                        title={fitNames[fitIndex]}
                    >
                        <FitnessIcon
                            fitIndex={fitIndex}
                            stroke={strokeColor}
                            fill={fillColor}
                            strokeWidth={strokeWidth}
                            className="w-full h-full"
                        />
                    </div>
                );
            });
        }

        return null;
    };

    const isComposite = config.mode === 'composite' || (config.sections && config.sections.length > 0);

    const activeSections: FooterTrackerSection[] = isComposite
        ? (config.sections || DEFAULT_COMPOSITE_SECTIONS).filter(s => s.enabled)
        : [];

    const effectiveSections: FooterTrackerSection[] = activeSections.length > 0
        ? activeSections
        : isComposite
            ? [DEFAULT_COMPOSITE_SECTIONS[0], DEFAULT_COMPOSITE_SECTIONS[1]]
            : [];

    const containerStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        opacity: style.opacity ?? 1,
        boxSizing: 'border-box',
        padding: config.showBox ? `${config.boxPadding || 5}px` : '2px 4px',
        backgroundColor: config.showBox ? (config.boxBackgroundColor || '#f9fafb') : 'transparent',
        border: config.showBox ? `${config.boxBorderWidth || 1}px solid ${config.boxBorderColor || '#e5e7eb'}` : 'none',
        borderRadius: config.showBox ? `${config.boxBorderRadius || 6}px` : 0,
        borderTop: config.showTopDivider
            ? `${config.topDividerWidth || 1}px ${config.topDividerStyle || 'solid'} ${config.topDividerColor || config.boxBorderColor || '#e2e8f0'}`
            : (config.showBox ? `${config.boxBorderWidth || 1}px solid ${config.boxBorderColor || '#e5e7eb'}` : 'none')
    };

    // If Composite mode: Render all active sections side-by-side in one cohesive footer
    if (isComposite) {
        const showSectionDividers = config.showSectionDividers !== false && effectiveSections.length > 1;

        return (
            <div style={containerStyle} className="select-none overflow-hidden">
                <div
                    className="w-full flex items-center flex-wrap"
                    style={{
                        justifyContent: config.layoutDistribution === 'center'
                            ? 'center'
                            : config.layoutDistribution === 'start'
                            ? 'flex-start'
                            : config.layoutDistribution === 'end'
                            ? 'flex-end'
                            : 'space-between',
                        gap: `${Math.max(10, spacing * 2)}px`,
                        height: '100%'
                    }}
                >
                    {effectiveSections.map((sec, secIdx) => {
                        const secType = sec.type;
                        const secVariant = sec.iconVariant || (secType === 'water' ? 'glass' : secType === 'mood' ? 'faces_clean' : 'default');
                        let secCount = sec.itemCount;
                        if (!secCount) {
                            if (secType === 'water') secCount = 8;
                            else if (secType === 'mood') secCount = 5;
                            else if (secType === 'weather') secCount = 5;
                            else if (secType === 'meals') secCount = 4;
                            else if (secType === 'sleep') secCount = 5;
                            else if (secType === 'meds') secCount = 4;
                            else if (secType === 'fitness') secCount = 4;
                            else secCount = 1;
                        }

                        const secLabel = sec.label !== undefined ? sec.label : defaultLabels[secType];
                        const showSecLabel = sec.showLabel !== false;

                        return (
                            <React.Fragment key={sec.id || secIdx}>
                                <div
                                    className="flex items-center"
                                    style={{
                                        gap: `${spacing}px`,
                                        flex: secType === 'gratitude' ? 1 : 'none',
                                        minWidth: 0
                                    }}
                                >
                                    {showSecLabel && secLabel && (
                                        <span
                                            style={{
                                                fontFamily,
                                                fontSize,
                                                fontWeight,
                                                color: textColor,
                                                letterSpacing: `${style.letterSpacing || 0}px`,
                                                textTransform: (style.textTransform as any) || 'none',
                                                lineHeight: 1.1,
                                                whiteSpace: 'nowrap'
                                            }}
                                            className="shrink-0 mr-1"
                                        >
                                            {secLabel}
                                        </span>
                                    )}

                                    <div
                                        className="flex items-center"
                                        style={{
                                            gap: `${spacing}px`,
                                            flex: secType === 'gratitude' ? 1 : 'none'
                                        }}
                                    >
                                        {renderSectionItems(secType, secVariant, secCount, sec.customItemLabels, config.showItemLabels)}
                                    </div>
                                </div>

                                {showSectionDividers && secIdx < effectiveSections.length - 1 && (
                                    <div
                                        className="shrink-0 self-stretch my-0.5"
                                        style={{
                                            width: 1,
                                            backgroundColor: config.sectionDividerColor || '#cbd5e1',
                                            opacity: 0.5
                                        }}
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Single mode:
    const trackerType = config.trackerType || 'water';
    const iconVariant = config.iconVariant || 'glass';
    const showLabel = config.showLabel !== false;
    const labelPosition = config.labelPosition || 'left';
    const labelText = config.label !== undefined ? config.label : defaultLabels[trackerType];

    let count = config.itemCount;
    if (!count) {
        if (trackerType === 'water') count = 8;
        else if (trackerType === 'mood') count = 5;
        else if (trackerType === 'weather') count = 5;
        else if (trackerType === 'meals') count = 4;
        else if (trackerType === 'sleep') count = 5;
        else if (trackerType === 'meds') count = 4;
        else if (trackerType === 'fitness') count = 4;
        else count = 5;
    }

    const singleContainerStyle: React.CSSProperties = {
        ...containerStyle,
        flexDirection: labelPosition === 'top' ? 'column' : 'row',
        alignItems: labelPosition === 'top' ? (style.textAlign === 'center' ? 'center' : style.textAlign === 'right' ? 'flex-end' : 'flex-start') : 'center',
        justifyContent: style.textAlign === 'center' ? 'center' : style.textAlign === 'right' ? 'flex-end' : 'flex-start',
        gap: labelPosition === 'top' ? '2px' : '8px'
    };

    return (
        <div style={singleContainerStyle} className="select-none overflow-hidden">
            {showLabel && labelText && (
                <div
                    style={{
                        fontFamily,
                        fontSize,
                        fontWeight,
                        color: textColor,
                        letterSpacing: `${style.letterSpacing || 0}px`,
                        textTransform: (style.textTransform as any) || 'none',
                        lineHeight: 1.1,
                        whiteSpace: 'nowrap'
                    }}
                    className="shrink-0"
                >
                    {labelText}
                </div>
            )}

            <div
                className="flex items-center flex-wrap"
                style={{
                    gap: `${spacing}px`,
                    justifyContent: style.textAlign === 'center' ? 'center' : style.textAlign === 'right' ? 'flex-end' : 'flex-start',
                    flex: trackerType === 'gratitude' ? 1 : 'none',
                    minWidth: 0
                }}
            >
                {renderSectionItems(trackerType, iconVariant, count, config.customItemLabels, config.showItemLabels)}
            </div>
        </div>
    );
};
