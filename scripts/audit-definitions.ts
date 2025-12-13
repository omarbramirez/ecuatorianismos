import { promises as fs } from 'fs';
import { DOMParser, XMLSerializer } from 'xmldom';
import * as path from 'path';

const INPUT_FILE = path.join('./data.xml');
const OUTPUT_FILE = './reporte_auditoria_final.json';

interface Issue {
  lemma: string;
  subentry?: string; // Si es undefined, el problema está en el nivel superior
  type: 'ZOMBIE_NODE' | 'EMPTY_EXAMPLE_WITH_CONTENT' | 'GHOST_DEFINITION';
  details: string;
  hasSubentries: boolean; // Para saber si el lema padre "se salva" por tener hijos
  contentPreview?: string;
}

const serializer = new XMLSerializer();

// Utilitarios de texto
function getTextContent(parent: Element, tagName: string): string {
    const list = parent.getElementsByTagName(tagName);
    if (list && list.length > 0) {
        return list.item(0)?.textContent?.trim() || '';
    }
    return '';
}

function getInnerXML(node: Element | null | undefined): string {
  if (!node) return '';
  if (node.childNodes) {
      let out = '';
      for (let i = 0; i < node.childNodes.length; i++) {
        out += serializer.serializeToString(node.childNodes.item(i) as any);
      }
      return out.trim();
  }
  return '';
}

async function auditComprehensive() {
  console.log(`🚀 Iniciando auditoría integral sobre ${INPUT_FILE}...`);
  
  try {
      const xmlContent = await fs.readFile(INPUT_FILE, 'utf-8');
      const doc = new DOMParser().parseFromString(xmlContent, 'text/xml');
      const lemmas = doc.getElementsByTagName('Lemma');
      const issues: Issue[] = [];

      console.log(`📊 Analizando ${lemmas.length} entradas...`);

      for (let i = 0; i < lemmas.length; i++) {
        const lemmaEl = lemmas.item(i) as Element;
        
        // Datos del Lema
        const lemmaSignNode = lemmaEl.getElementsByTagName('Lemma.LemmaSign').item(0);
        const lemmaSign = lemmaSignNode ? lemmaSignNode.textContent?.trim() || 'Desconocido' : 'Desconocido';
        
        // Verificamos si tiene subentradas válidas (Regla de Jerarquía)
        const subentriesNodes = lemmaEl.getElementsByTagName('Subentry');
        const hasSubentries = subentriesNodes.length > 0;

        // 1. Revisar definiciones del PADRE (Nivel Lema)
        for (let s = 0; s < lemmaEl.childNodes.length; s++) {
          const node = lemmaEl.childNodes.item(s);
          if (node.nodeName === 'Sense') {
             auditDefinitionsInNode(node as Element, lemmaSign, undefined, issues, hasSubentries);
          }
          // A veces hay definiciones hermanas directas (estructura legacy)
          else if (node.nodeName === 'Definition') {
             // Envolvemos en un fake element para reutilizar la función
             const fakeSense = doc.createElement('Sense');
             fakeSense.appendChild(node.cloneNode(true));
             auditDefinitionsInNode(fakeSense, lemmaSign, undefined, issues, hasSubentries);
          }
        }

        // 2. Revisar definiciones de los HIJOS (Subentradas)
        for (let j = 0; j < subentriesNodes.length; j++) {
          const subEl = subentriesNodes.item(j) as Element;
          const subRawSign = getInnerXML(subEl.getElementsByTagName('Subentry.LemmaSign').item(0));
          const subSignClean = subRawSign.replace(/<[^>]+>/g, '').trim();

          const subSenses = subEl.getElementsByTagName('Sense');
          for (let k = 0; k < subSenses.length; k++) {
            auditDefinitionsInNode(subSenses.item(k) as Element, lemmaSign, subSignClean, issues, false); // Subentry no tiene "subentries" propias
          }
        }
      }

      // Guardar
      await fs.writeFile(OUTPUT_FILE, JSON.stringify(issues, null, 2));
      
      console.log(`✅ Auditoría finalizada.`);
      console.log(`⚠️  Total de incidencias: ${issues.length}`);
      
      // Resumen por tipo
      const counts = issues.reduce((acc, curr) => {
          acc[curr.type] = (acc[curr.type] || 0) + 1;
          return acc;
      }, {} as Record<string, number>);
      console.table(counts);

      console.log(`📂 Reporte guardado en: ${path.resolve(OUTPUT_FILE)}`);

  } catch (error) {
      console.error("❌ Error:", error);
  }
}

function auditDefinitionsInNode(senseEl: Element, lemmaSign: string, subentrySign: string | undefined, issuesArray: Issue[], parentHasSubentries: boolean) {
  const definitions = senseEl.getElementsByTagName('Definition');

  for (let i = 0; i < definitions.length; i++) {
    const defEl = definitions.item(i) as Element;
    
    // 1. Extraer Contenidos
    const defText = getTextContent(defEl, 'Definition.Definición');
    const acepcion = getTextContent(defEl, 'Definition.Acepción');
    
    // REGLA MAESTRA: Si tiene '+', es válido. Saltamos.
    if (defText.includes('+')) continue;

    // Verificar Ejemplos
    const examples = defEl.getElementsByTagName('Example');
    let hasValidExampleText = false;
    let hasExampleNode = false;

    // Analizamos si hay algún ejemplo válido
    for (let j = 0; j < examples.length; j++) {
        hasExampleNode = true;
        const exEl = examples.item(j) as Element;
        const exText = getTextContent(exEl, 'Example.Example');
        
        // Si hay texto real (no vacío, no solo ":")
        if (exText && exText !== ':' && exText.trim().length > 0) {
            hasValidExampleText = true;
        }
    }

    const isDefEmpty = (!defText || defText.trim() === '');

    // --- LÓGICA DE DETECCIÓN DE ERRORES ---

    // CASO 1: ZOMBIE NODE (El caso "Papi" Acepción 2)
    // No hay texto de definición Y (No hay nodo de ejemplo O el nodo está vacío de texto)
    if (isDefEmpty && !hasValidExampleText) {
        issuesArray.push({
            lemma: lemmaSign,
            subentry: subentrySign,
            type: 'ZOMBIE_NODE',
            details: `Acepción ${acepcion || '?'} vacía y sin ejemplos. Nodo muerto.`,
            hasSubentries: parentHasSubentries
        });
        continue;
    }

    // CASO 2: GHOST DEFINITION (Definición vacía, pero tiene ejemplos)
    // Esto es raro, ¿un ejemplo sin definición previa? Puede ser un error de estructura.
    if (isDefEmpty && hasValidExampleText) {
        issuesArray.push({
            lemma: lemmaSign,
            subentry: subentrySign,
            type: 'GHOST_DEFINITION',
            details: `Hay ejemplos pero falta la definición.`,
            hasSubentries: parentHasSubentries
        });
        continue;
    }

    // CASO 3: EMPTY EXAMPLE WITH CONTENT (El caso "Llevar")
    // Hay definición, hay nodo de ejemplo, pero el texto del ejemplo está vacío.
    // Esto sugiere que la definición podría contener el ejemplo, o falta copiarlo.
    if (!isDefEmpty && hasExampleNode && !hasValidExampleText) {
        issuesArray.push({
            lemma: lemmaSign,
            subentry: subentrySign,
            type: 'EMPTY_EXAMPLE_WITH_CONTENT',
            details: `Definición existe, pero el bloque de ejemplo está vacío (posible mal ubicación).`,
            contentPreview: defText.substring(0, 50) + '...',
            hasSubentries: parentHasSubentries
        });
    }
  }
}

auditComprehensive();