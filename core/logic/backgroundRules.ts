import { AgendaConfig, BackgroundConfig, BackgroundRulesConfig, CategoryBackgroundConfig } from '../../types';

export type BackgroundCategoryType = 'miolo' | 'mensais' | 'divisorias' | 'iniciais';

/**
 * Função principal para resolver qual plano de fundo uma página deve receber,
 * aplicando estritamente a hierarquia de prioridades solicitada:
 * 
 * 1️⃣ Página Específica (specificPages[pageIndex])
 * 2️⃣ Par / Ímpar Específico da Categoria (category.even / category.odd baseado no índice relativo da página na categoria)
 * 3️⃣ Fundo Padrão da Categoria (category.default)
 * 4️⃣ Fundo Geral da Agenda (global)
 */
export function getEffectiveBackgroundForPage(
    pageIndex: number, // Número absoluto da página na agenda (1-based, ex: 37)
    category: BackgroundCategoryType,
    categoryRelativeIndex: number, // Posição 1-based da página dentro da sua própria categoria (1, 2, 3...)
    rules?: BackgroundRulesConfig,
    legacyPageSpecificBg?: BackgroundConfig,
    legacyGlobalBgs?: BackgroundConfig[]
): BackgroundConfig | undefined {
    if (rules) {
        // 1️⃣ Página específica (Priority 1)
        if (rules.specificPages && rules.specificPages[pageIndex] !== undefined) {
            const specificBg = rules.specificPages[pageIndex];
            if (specificBg && specificBg.type) {
                return specificBg.type === 'none' ? undefined : specificBg;
            }
        }

        // 2️⃣ Par/Ímpar específico da categoria (Priority 2)
        const catConfig = rules[category];
        if (catConfig) {
            const isParityEven = categoryRelativeIndex % 2 === 0;
            const parityBg = isParityEven ? catConfig.even : catConfig.odd;
            if (parityBg && parityBg.type && parityBg.type !== 'none') {
                return parityBg;
            }

            // 3️⃣ Fundo específico da categoria (Priority 3)
            if (catConfig.default && catConfig.default.type && catConfig.default.type !== 'none') {
                return catConfig.default;
            }
        }

        // 4️⃣ Fundo geral da agenda (Priority 4)
        if (rules.global && rules.global.type && rules.global.type !== 'none') {
            return rules.global;
        }
    }

    // Fallback: se houver fundo específico legado na página
    if (legacyPageSpecificBg && legacyPageSpecificBg.type && legacyPageSpecificBg.type !== 'none') {
        return legacyPageSpecificBg;
    }

    // Fallback: processar lista legada de backgrounds
    if (legacyGlobalBgs && legacyGlobalBgs.length > 0) {
        for (const bg of legacyGlobalBgs) {
            if (bg && bg.type && bg.type !== 'none') {
                const target = bg.targetType || 'universal';
                const filter = bg.pageFilter || 'all';

                let categoryMatch = true;
                if (target === 'daily' && category !== 'miolo') categoryMatch = false;
                if (target === 'intro' && category !== 'iniciais') categoryMatch = false;
                if ((target === 'monthly' || target === 'monthly_intro') && category !== 'mensais') categoryMatch = false;
                if ((target === 'divider' || target === 'divider_verso') && category !== 'divisorias') categoryMatch = false;

                let parityMatch = true;
                if (filter === 'even' || target === 'even') {
                    if (categoryRelativeIndex % 2 !== 0) parityMatch = false;
                } else if (filter === 'odd' || target === 'odd') {
                    if (categoryRelativeIndex % 2 === 0) parityMatch = false;
                }

                if (categoryMatch && parityMatch) {
                    return bg;
                }
            }
        }
    }

    return undefined;
}

/**
 * Converte configurações legadas do projeto para a nova estrutura de regras hierárquicas.
 */
export function migrateLegacyBackgroundsToRules(config: Partial<AgendaConfig>): BackgroundRulesConfig {
    const rules: BackgroundRulesConfig = config.backgroundRules ? JSON.parse(JSON.stringify(config.backgroundRules)) : {};

    // 1. Se rules.global não estiver definido, mas config.background sim, herda o fundo global
    if ((!rules.global || rules.global.type === 'none') && config.background && config.background.type && config.background.type !== 'none') {
        rules.global = { ...config.background };
    }

    // 2. Se a estrutura de regras estava vazia e existem backgrounds legados no array config.backgrounds
    if (!config.backgroundRules && config.backgrounds && config.backgrounds.length > 0) {
        for (const bg of config.backgrounds) {
            if (!bg || bg.type === 'none') continue;

            const target = bg.targetType || 'universal';
            const filter = bg.pageFilter || 'all';

            if (target === 'universal' || target === 'all') {
                if (!rules.global || rules.global.type === 'none') rules.global = { ...bg };
            } else {
                let catKey: BackgroundCategoryType = 'miolo';
                if (target === 'daily') catKey = 'miolo';
                else if (target === 'intro') catKey = 'iniciais';
                else if (target === 'monthly' || target === 'monthly_intro') catKey = 'mensais';
                else if (target === 'divider' || target === 'divider_verso') catKey = 'divisorias';

                if (!rules[catKey]) rules[catKey] = {};

                if (filter === 'even' || target === 'even') {
                    if (!rules[catKey]!.even) rules[catKey]!.even = { ...bg };
                } else if (filter === 'odd' || target === 'odd') {
                    if (!rules[catKey]!.odd) rules[catKey]!.odd = { ...bg };
                } else {
                    if (!rules[catKey]!.default) rules[catKey]!.default = { ...bg };
                }
            }
        }
    }

    // 3. Fundo de divisória legado
    if ((!rules.divisorias || !rules.divisorias.default) && config.monthlyDividerStyle?.background && config.monthlyDividerStyle.background.type !== 'none') {
        if (!rules.divisorias) rules.divisorias = {};
        rules.divisorias.default = { ...config.monthlyDividerStyle.background };
    }

    return rules;
}

/**
 * Recupera o fundo configurado para uma chave de regra específica.
 */
export function getRuleBackground(
    rules: BackgroundRulesConfig,
    category: 'global' | BackgroundCategoryType | 'specific',
    scope: 'default' | 'even' | 'odd' | number
): BackgroundConfig | undefined {
    if (category === 'global') {
        return rules.global;
    }

    if (category === 'specific') {
        const pageNum = typeof scope === 'number' ? scope : parseInt(String(scope), 10);
        return rules.specificPages?.[pageNum];
    }

    const catKey = category as BackgroundCategoryType;
    const catConfig = rules[catKey];

    if (scope === 'even') {
        return catConfig?.even || catConfig?.default || rules.global;
    }
    if (scope === 'odd') {
        return catConfig?.odd || catConfig?.default || rules.global;
    }
    return catConfig?.default || rules.global;
}

/**
 * Atualiza ou remove uma regra específica na estrutura BackgroundRulesConfig.
 */
export function updateRuleBackground(
    rules: BackgroundRulesConfig,
    category: 'global' | BackgroundCategoryType | 'specific',
    scope: 'default' | 'even' | 'odd' | number,
    bgConfig: BackgroundConfig | null
): BackgroundRulesConfig {
    const newRules: BackgroundRulesConfig = JSON.parse(JSON.stringify(rules));

    if (category === 'global') {
        if (bgConfig && bgConfig.type !== 'none') {
            newRules.global = { ...bgConfig };
        } else {
            delete newRules.global;
        }
        return newRules;
    }

    if (category === 'specific') {
        const pageNum = typeof scope === 'number' ? scope : parseInt(String(scope), 10);
        if (!newRules.specificPages) newRules.specificPages = {};
        const updatedSpecific = { ...newRules.specificPages };
        if (bgConfig && bgConfig.type !== 'none') {
            updatedSpecific[pageNum] = { ...bgConfig };
        } else {
            delete updatedSpecific[pageNum];
        }
        newRules.specificPages = updatedSpecific;
        return newRules;
    }

    const catKey = category as BackgroundCategoryType;
    const currentCat: CategoryBackgroundConfig = { ...(newRules[catKey] || {}) };

    if (scope === 'even') {
        if (bgConfig && bgConfig.type !== 'none') {
            currentCat.even = { ...bgConfig };
            // Se existia uma regra 'default' e 'odd' não estava definida,
            // preserva a regra prévia em 'odd' para criar duas regras separadas e independentes!
            if (currentCat.default && currentCat.default.type && currentCat.default.type !== 'none' && !currentCat.odd) {
                currentCat.odd = { ...currentCat.default };
                delete currentCat.default;
            }
        } else {
            delete currentCat.even;
        }
    } else if (scope === 'odd') {
        if (bgConfig && bgConfig.type !== 'none') {
            currentCat.odd = { ...bgConfig };
            // Se existia uma regra 'default' e 'even' não estava definida,
            // preserva a regra prévia em 'even' para criar duas regras separadas e independentes!
            if (currentCat.default && currentCat.default.type && currentCat.default.type !== 'none' && !currentCat.even) {
                currentCat.even = { ...currentCat.default };
                delete currentCat.default;
            }
        } else {
            delete currentCat.odd;
        }
    } else {
        // scope === 'default' ("Toda a Categoria")
        if (bgConfig && bgConfig.type !== 'none') {
            currentCat.default = { ...bgConfig };
            delete currentCat.even;
            delete currentCat.odd;
        } else {
            delete currentCat.default;
            delete currentCat.even;
            delete currentCat.odd;
        }
    }

    if (Object.keys(currentCat).length === 0) {
        delete newRules[catKey];
    } else {
        newRules[catKey] = currentCat;
    }

    return newRules;
}

/**
 * Aplica em lote uma configuração de fundo para múltiplos alvos selecionados ("Aplicar este fundo a...").
 */
export function applyBackgroundToTargets(
    rules: BackgroundRulesConfig,
    sourceBg: BackgroundConfig,
    targetKeys: string[],
    currentPageNum?: number
): BackgroundRulesConfig {
    let updated = { ...rules };

    for (const key of targetKeys) {
        if (key === 'global') {
            updated = updateRuleBackground(updated, 'global', 'default', { ...sourceBg });
        } else if (key === 'miolo_default') {
            updated = updateRuleBackground(updated, 'miolo', 'default', { ...sourceBg });
        } else if (key === 'miolo_even') {
            updated = updateRuleBackground(updated, 'miolo', 'even', { ...sourceBg });
        } else if (key === 'miolo_odd') {
            updated = updateRuleBackground(updated, 'miolo', 'odd', { ...sourceBg });
        } else if (key === 'divisorias_default') {
            updated = updateRuleBackground(updated, 'divisorias', 'default', { ...sourceBg });
        } else if (key === 'divisorias_even') {
            updated = updateRuleBackground(updated, 'divisorias', 'even', { ...sourceBg });
        } else if (key === 'divisorias_odd') {
            updated = updateRuleBackground(updated, 'divisorias', 'odd', { ...sourceBg });
        } else if (key === 'mensais_default') {
            updated = updateRuleBackground(updated, 'mensais', 'default', { ...sourceBg });
        } else if (key === 'mensais_even') {
            updated = updateRuleBackground(updated, 'mensais', 'even', { ...sourceBg });
        } else if (key === 'mensais_odd') {
            updated = updateRuleBackground(updated, 'mensais', 'odd', { ...sourceBg });
        } else if (key === 'iniciais_default') {
            updated = updateRuleBackground(updated, 'iniciais', 'default', { ...sourceBg });
        } else if (key === 'iniciais_even') {
            updated = updateRuleBackground(updated, 'iniciais', 'even', { ...sourceBg });
        } else if (key === 'iniciais_odd') {
            updated = updateRuleBackground(updated, 'iniciais', 'odd', { ...sourceBg });
        } else if (key.startsWith('page_')) {
            const num = parseInt(key.replace('page_', ''), 10);
            if (!isNaN(num)) {
                updated = updateRuleBackground(updated, 'specific', num, { ...sourceBg });
            }
        } else if (key === 'current_page' && currentPageNum !== undefined) {
            updated = updateRuleBackground(updated, 'specific', currentPageNum, { ...sourceBg });
        }
    }

    return updated;
}
