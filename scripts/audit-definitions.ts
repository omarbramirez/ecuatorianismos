import { promises as fs } from 'fs';
import { DOMParser, XMLSerializer } from 'xmldom';

// Configuración
const INPUT_FILE = './data.xml'; // Tu archivo XML
const OUTPUT_FILE = './reporte_definiciones.json';

// Interfaces para el reporte
interface Issue {
    lemma: string;
    subentry?: string; // Opcional, si el problema está en una subentrada
    type: 'EMPTY' | 'POINTER_ONLY';
    content: string; // Para que el cliente vea qué hay dentro (ej: "<Bold>...</Bold>")
}

const serializer = new XMLSerializer();

// Función auxiliar para obtener el HTML interno limpio
function getInnerXML(node: Element): string {
    let out = '';
    for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes.item(i);
        out += serializer.serializeToString(child as any);
    }
    return out.trim();
}

async function auditDefinitions() {
    console.log(`🔍 Iniciando auditoría sobre ${INPUT_FILE}...`);

    const xmlContent = await fs.readFile(INPUT_FILE, 'utf-8');
    const doc = new DOMParser().parseFromString(xmlContent, 'text/xml');
    const lemmas = doc.getElementsByTagName('Lemma');

    const issues: Issue[] = [];
    let totalDefinitionsChecked = 0;

    // Recorremos cada Lema
    for (let i = 0; i < lemmas.length; i++) {
        const lemmaEl = lemmas.item(i) as Element;
        const lemmaSign = lemmaEl.getElementsByTagName('Lemma.LemmaSign').item(0)?.textContent?.trim() || 'Desconocido';

        // 1. Revisar definiciones del LEMA PRINCIPAL (si tiene sentidos directos)
        // Buscamos dentro de los Senses directos del Lemma
        const lemmaSenses = lemmaEl.getElementsByTagName('Sense');
        // Ojo: getElementsByTagName busca en toda la profundidad, así que filtramos
        // los que son hijos directos o cercanos, aunque para este reporte rápido,
        // iterar todos los senses y ver si pertenecen a un subentry o al lemma es complejo.
        // Simplificaremos iterando las definiciones directas si la estructura lo permite,
        // o mejor: iteramos la estructura lógica.

        // Iteración Lógica: Lema -> Sense -> Definition
        for (let s = 0; s < lemmaEl.childNodes.length; s++) {
            const senseNode = lemmaEl.childNodes.item(s);
            if (senseNode.nodeName === 'Sense') {
                checkDefinitionsInNode(senseNode as Element, lemmaSign, undefined, issues);
            }
        }

        // 2. Revisar SUBENTRADAS
        const subentries = lemmaEl.getElementsByTagName('Subentry');
        for (let j = 0; j < subentries.length; j++) {
            const subEl = subentries.item(j) as Element;
            // Obtener nombre de subentrada (a veces tiene <Underline>, etc)
            const subRawSign = getInnerXML(subEl.getElementsByTagName('Subentry.LemmaSign').item(0) as Element);
            // Limpiamos etiquetas para el reporte
            const subSignClean = subRawSign.replace(/<[^>]+>/g, '').trim();

            // Revisar Senses dentro de la Subentrada
            const subSenses = subEl.getElementsByTagName('Sense');
            for (let k = 0; k < subSenses.length; k++) {
                checkDefinitionsInNode(subSenses.item(k) as Element, lemmaSign, subSignClean, issues);
            }
        }
    }

    // Escribir reporte
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(issues, null, 2));

    console.log(`✅ Auditoría finalizada.`);
    console.log(`📝 Total de lemas analizados: ${lemmas.length}`);
    console.log(`⚠️  Problemas encontrados: ${issues.length}`);
    console.log(`📂 Reporte guardado en: ${OUTPUT_FILE}`);
}

/**
 * Función central de validación.
 * Analiza las definiciones dentro de un nodo Sense.
 */
function checkDefinitionsInNode(senseEl: Element, lemmaSign: string, subentrySign: string | undefined, issuesArray: Issue[]) {
    const definitions = senseEl.getElementsByTagName('Definition');

    for (let i = 0; i < definitions.length; i++) {
        const defEl = definitions.item(i) as Element;

        // Buscamos <Definition.Definición>
        const defContentNode = defEl.getElementsByTagName('Definition.Definición').item(0);

        if (!defContentNode) {
            // Caso raro: No existe el tag de definición
            issuesArray.push({
                lemma: lemmaSign,
                subentry: subentrySign,
                type: 'EMPTY',
                content: '(Tag Definition.Definición inexistente)'
            });
            continue;
        }

        const rawContent = getInnerXML(defContentNode);
        const plainText = defContentNode.textContent?.trim() || '';

        // --- CRITERIOS DE FALLA ---

        // 1. Definición Vacía
        if (!rawContent || rawContent === '') {
            issuesArray.push({
                lemma: lemmaSign,
                subentry: subentrySign,
                type: 'EMPTY',
                content: ''
            });
            continue;
        }

        // 2. Definición tipo "Puntero" (Referencia Cruzada Pura)
        // El caso de "traer": <Bold>llevar a mal andar</Bold>
        // Lógica: 
        // - El texto plano no está vacío.
        // - El HTML empieza con <Bold> y termina con </Bold>.
        // - (Opcional) El texto es corto (menos de 50 caracteres para evitar falsos positivos de definiciones largas en negrita).

        // Normalizamos para quitar espacios extra fuera de tags
        const isWrappedInBold = rawContent.match(/^\s*<Bold>[\s\S]*<\/Bold>\s*$/i);

        // Si está envuelto en negrita Y no tiene texto fuera de ella.
        if (isWrappedInBold) {
            issuesArray.push({
                lemma: lemmaSign,
                subentry: subentrySign,
                type: 'POINTER_ONLY',
                content: rawContent
            });
        }
    }
}

// Ejecutar
auditDefinitions().catch(console.error);