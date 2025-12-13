import { promises as fs } from 'fs';
import { DOMParser, XMLSerializer } from 'xmldom';
import * as path from 'path';

const INPUT_FILE = path.join('./data.xml');
const OUTPUT_FILE = './reporte_estructuras.json';

// Interfaz para el reporte
interface StructureGroup {
    signature: string; // La "huella digital" de la estructura
    count: number;     // Cuántos lemas tienen esta estructura exacta
    examples: string[]; // Nombres de los primeros 5 lemas como ejemplo
}

async function analyzeStructure() {
    console.log(`🔬 Iniciando análisis estructural profundo de ${INPUT_FILE}...`);

    try {
        const xmlContent = await fs.readFile(INPUT_FILE, 'utf-8');
        const doc = new DOMParser().parseFromString(xmlContent, 'text/xml');
        const lemmas = doc.getElementsByTagName('Lemma');

        console.log(`📊 Total de lemas encontrados: ${lemmas.length}`);

        // Mapa para agrupar estructuras idénticas
        // Clave: Firma Estructural (string), Valor: Datos del grupo
        const structureMap = new Map<string, StructureGroup>();

        for (let i = 0; i < lemmas.length; i++) {
            const lemmaEl = lemmas.item(i) as Element;
            
            // 1. Obtener el nombre del lema para referencia
            const lemmaSign = lemmaEl.getElementsByTagName('Lemma.LemmaSign').item(0)?.textContent?.trim() || 'Desconocido';

            // 2. Generar la firma recursiva
            const signature = generateNodeSignature(lemmaEl);

            // 3. Agrupar
            if (!structureMap.has(signature)) {
                structureMap.set(signature, {
                    signature: signature,
                    count: 0,
                    examples: []
                });
            }

            const group = structureMap.get(signature)!;
            group.count++;
            // Guardamos solo los primeros 5 ejemplos para no saturar el JSON
            if (group.examples.length < 5) {
                group.examples.push(lemmaSign);
            }
        }

        // 4. Convertir a array y ordenar
        // Ordenamos por "rareza": primero las estructuras que aparecen menos veces (posibles errores)
        const sortedReport = Array.from(structureMap.values()).sort((a, b) => a.count - b.count);

        await fs.writeFile(OUTPUT_FILE, JSON.stringify(sortedReport, null, 2));

        console.log(`✅ Análisis finalizado.`);
        console.log(`🧩 Se encontraron ${sortedReport.length} variaciones estructurales únicas.`);
        console.log(`📂 Reporte guardado en: ${path.resolve(OUTPUT_FILE)}`);
        
        // Imprimir resumen rápido en consola de los "bichos raros" (únicos)
        const uniqueStructures = sortedReport.filter(g => g.count === 1);
        console.log(`⚠️  ATENCIÓN: Hay ${uniqueStructures.length} estructuras que aparecen UNA sola vez (posibles anomalías).`);

    } catch (error) {
        console.error("❌ Error durante el análisis:", error);
    }
}

/**
 * Función Recursiva que genera una "Huella Digital" de la estructura del nodo.
 * Formato ejemplo: Lemma(Lemma.LemmaSign, Sense(Definition(Example)))
 */
function generateNodeSignature(node: Element): string {
    const tagName = node.nodeName;
    
    // Obtenemos los hijos que sean ELEMENTOS (ignoramos texto/espacios)
    const children: Element[] = [];
    if (node.childNodes) {
        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes.item(i);
            if (child && child.nodeType === 1) { // 1 = Element Node
                children.push(child as Element);
            }
        }
    }

    // Si no tiene hijos, retornamos solo el nombre (ej: "Lemma.LemmaSign")
    if (children.length === 0) {
        return tagName;
    }

    // Si tiene hijos, construimos la firma recursivamente
    // Mapeamos cada hijo a su propia firma
    const childrenSignatures = children.map(child => generateNodeSignature(child));
    
    // Unimos las firmas de los hijos
    return `${tagName}(${childrenSignatures.join(', ')})`;
}

analyzeStructure();