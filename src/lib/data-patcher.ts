// lib/data-patcher.ts
import { Lemma, Sense, Definition } from "./parser"; // Ajusta la ruta de importación según tu estructura

/**
 * MIDDLEWARE TEMPORAL DE CORRECCIÓN DE DATOS
 * Propósito: Interceptar lemas con errores estructurales conocidos (reporte auditoría)
 * y aplicar parches en memoria para evitar errores visuales en la UI.
 * * ESTADO: ACTIVO (Pendiente de corrección de XML por parte del cliente)
 */

export function applyDataPatches(lemmas: Lemma[]): Lemma[] {
    console.log("🩹 Aplicando parches temporales de datos...");

    return lemmas.map(lemma => {
        // Normalizamos para comparación
        const sign = lemma.lemmaSign.toLowerCase().trim();
        let patchedLemma = fixPersonaAdjectiveMark(lemma);
        // ---------------------------------------------------------
        // CATEGORÍA A: NODOS ZOMBIE (Eliminar acepciones vacías)
        // ---------------------------------------------------------
        if (['pan', 'rascabonito', 'rehogado'].includes(sign)) {
            patchedLemma=  removeEmptyDefinitions(patchedLemma);
        }

        if (sign === 'papi') {
            // Caso específico: Papi tiene una acepción 2 vacía
            patchedLemma = removeEmptyDefinitions(patchedLemma);
        }

        // ---------------------------------------------------------
        // CATEGORÍA B: DEFINICIONES FANTASMA (Falta texto)
        // Acción: Inyectar placeholder "[Definición en revisión]"
        // ---------------------------------------------------------
        if (['horcón', 'hualingo, -a', 'rayado, -a'].includes(sign)) {
            patchedLemma = injectPlaceholderDefinition(patchedLemma);
        }

        // ---------------------------------------------------------
        // CATEGORÍA C: REFERENCIAS ROTAS (Falta el "+")
        // Acción: Agregar "+" al texto para que el parser lo detecte como link
        // ---------------------------------------------------------
        if (['balurdo, -a', 'checo', 'chilchigua', 'guasicamía'].includes(sign)) {
            patchedLemma =  fixBrokenCrossReference(patchedLemma);
        }

        // ---------------------------------------------------------
        // CATEGORÍA D: ERRORES DE CONTENIDO (Ejemplo vs Definición)
        // ---------------------------------------------------------

        // Caso: Llevar -> llevar a mal andar (Texto de ejemplo en definición)
        if (sign === 'llevar') {
            patchedLemma = fixLlevarSubentry(patchedLemma);
        }

        // Caso: Taza, Trinquete, Babear (Ejemplos vacíos estorbando)
        if (['taza', 'trinquete', 'babear'].includes(sign)) {
            patchedLemma = removeEmptyExamples(patchedLemma);
        }

        return lemma;
    });
}

// --- HELPER FUNCTIONS (Cirugía Específica) ---

function removeEmptyDefinitions(lemma: Lemma): Lemma {
    lemma.senses.forEach(sense => {
        sense.definitions = sense.definitions.filter(def => {
            // Si no tiene texto Y no tiene ejemplos válidos -> Borrar
            const hasText = def.plainText && def.plainText.trim().length > 0;
            const hasExamples = def.examples.some(ex => ex.text.trim().length > 0);
            return hasText || hasExamples;
        });
    });
    return lemma;
}

function injectPlaceholderDefinition(lemma: Lemma): Lemma {
    lemma.senses.forEach(sense => {
        sense.definitions.forEach(def => {
            if (!def.plainText || def.plainText.trim() === '') {
                def.text = '<span class="italic text-gray-400">[Definición en proceso de revisión editorial]</span>';
                def.plainText = '[Definición en proceso de revisión editorial]';
            }
        });
    });
    return lemma;
}

function fixBrokenCrossReference(lemma: Lemma): Lemma {
    lemma.senses.forEach(sense => {
        sense.definitions.forEach(def => {
            // Si el texto es corto y no tiene "+", se lo agregamos
            if (def.plainText.length < 50 && !def.plainText.includes('+')) {
                // Envolvemos en <b> para que el RichText lo detecte
                def.text = `<b>${def.plainText.trim()} +</b>`;
            }
        });
    });
    return lemma;
}

function removeEmptyExamples(lemma: Lemma): Lemma {
    const cleaner = (defs: Definition[]) => {
        defs.forEach(def => {
            def.examples = def.examples.filter(ex => ex.text && ex.text.trim().length > 0 && ex.text !== ':');
        });
    };

    lemma.senses.forEach(s => cleaner(s.definitions));
    lemma.subentries.forEach(sub => sub.sense.forEach(s => cleaner(s.definitions)));

    return lemma;
}

function fixLlevarSubentry(lemma: Lemma): Lemma {
    // Buscamos la subentrada específica
    const sub = lemma.subentries.find(s => s.sign.includes('llevar') && s.sign.includes('mal andar'));
    if (sub) {
        sub.sense.forEach(s => {
            s.definitions.forEach(def => {
                // Si parece un ejemplo ("Esos problemas...")
                if (def.plainText.startsWith('Esos problemas')) {
                    // 1. Movemos el texto al ejemplo
                    def.examples = [{
                        text: def.text, // El texto original era el ejemplo
                        isAdHoc: true,
                        adHocLabel: 'Ad hoc'
                    }];
                    // 2. Ponemos placeholder en definición
                    def.text = '<span class="italic text-gray-400">[Definición en proceso de revisión editorial]</span>';
                }
            });
        });
    }
    return lemma;
}

/**
 * REGLA LEXICOGRÁFICA: Normalización de sustantivos de persona como adjetivos.
 * Se inyecta la marca en el campo 'utc' para mantener la consistencia con 
 * el nodo <Definition.UTC> del XML original.
 */
function fixPersonaAdjectiveMark(lemma: Lemma): Lemma {
  const UTC_MARK = "U.t.c.adj.";
  const PERSONA_REGEX = /^persona\b/i;

  const patchDefinitions = (defs: Definition[]): Definition[] => {
    return defs.map(def => {
      // Verificamos si la definición (plainText) comienza con "persona"
      const startsWithPersona = PERSONA_REGEX.test(def.plainText.trim());

      if (startsWithPersona) {
        // Solo actuamos si el campo utc está vacío o no contiene la marca
        const hasUtcMark = def.utc?.toLowerCase().includes("u.t.c.adj");

        if (!hasUtcMark) {
          return {
            ...def,
            // Inyectamos en el campo utc que su parser ya extrae
            utc: UTC_MARK
          };
        }
      }
      return def;
    });
  };

  // Aplicación recursiva en acepciones y subentradas
  lemma.senses.forEach(s => {
    s.definitions = patchDefinitions(s.definitions);
  });

  lemma.subentries.forEach(sub => {
    sub.sense.forEach(s => {
      s.definitions = patchDefinitions(s.definitions);
    });
  });

  return lemma;
}