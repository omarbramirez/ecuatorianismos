// parser-node-ts.ts
import { promises as fs } from 'fs';
import { DOMParser, XMLSerializer } from 'xmldom';

// --- TIPOS ---
export type Example = {
  text: string;
  source?: string;
  isAdHoc?: boolean;
  adHocLabel?: string;
};

export type Definition = {
  acepcion?: string;
  contorno?: string;
  text: string;
  plainText: string;
  usageLabel?: string;
  geographicLabel?: string;
  utc?: string;
  examples: Example[];
};

export type Sense = {
  senseNumber?: string;
  etimologia?: string;
  scientificName?: string;
  pos?: string;
  definitions: Definition[];
};

export type Subentry = {
  sign: string;
  sense: Sense[];
};

export type Lemma = {
  lemmaSign: string;
  etimologia?: string;
  observations?: string;
  variants?: string | string[];
  senses: Sense[];
  subentries: Subentry[];
};

// --- UTILIDADES DOM ---
const parser = new DOMParser();
const serializer = new XMLSerializer();

// Helper seguro para trim
const trimOrEmpty = (s: string | null | undefined) => (s ? s.trim() : '');

// Busca el primer elemento hijo por nombre de etiqueta (Directo o profundo)
// Nota: getElementsByTagName busca en profundidad. Para estructuras planas esto está bien
// siempre y cuando los nombres de las etiquetas sean únicos por nivel.
function getFirstElement(parent: Element, tagName: string): Element | null {
  const list = parent.getElementsByTagName(tagName);
  if (list && list.length > 0) return list.item(0) as Element;
  return null;
}

// Extracción segura de texto
function getTextContent(parent: Element, tagName: string): string {
  const el = getFirstElement(parent, tagName);
  return el ? trimOrEmpty(el.textContent) : '';
}

// Transformación de etiquetas XML visuales a HTML estándar
function transformXmlToHtml(xml: string): string {
  if (!xml) return '';
  return xml
    .replace(/<Bold>/gi, '<b>')
    .replace(/<\/Bold>/gi, '</b>')
    .replace(/<Italic>/gi, '<i>')
    .replace(/<\/Italic>/gi, '</i>')
    .replace(/<Underline>/gi, '<u>')
    .replace(/<\/Underline>/gi, '</u>')
    // Agregamos manejo de saltos de línea si existen en el XML
    .replace(/\n/g, ' '); 
}

// FUNCIÓN BLINDADA: Obtiene el XML interno (HTML) de un nodo
function getInnerXML(parent: Element, tagName: string): string {
  const el = getFirstElement(parent, tagName);
  // Protección contra nulos
  if (!el) return '';
  
  let out = '';
  // Protección adicional: verificamos childNodes
  if (el.childNodes) {
    for (let i = 0; i < el.childNodes.length; i++) {
      const child = el.childNodes.item(i);
      // Serializamos el nodo a string preservando etiquetas internas
      out += serializer.serializeToString(child as any);
    }
  }
  return transformXmlToHtml(out.trim());
}

// --- LOGICA DE PARSEO ---

function parseExamples(defEl: Element): Example[] {
  const examplesNodes = defEl.getElementsByTagName('Example');
  const examples: Example[] = [];

  for (let i = 0; i < examplesNodes.length; i++) {
    const exEl = examplesNodes.item(i) as Element;

    // 1. Extracción: Priorizamos getInnerXML para capturar negritas dentro del ejemplo
    let text = getInnerXML(exEl, 'Example.Example');
    // Si falla (o está vacío), intentamos textContent
    if (!text) text = getTextContent(exEl, 'Example.Example');
    
    const source = getTextContent(exEl, 'Example.Source');
    const adHoc = getTextContent(exEl, 'Example.Ad.hoc');

    text = text ? text.trim() : '';

    // 3. FILTRO HEURÍSTICO (Validado con reporte_estructuras.json):
    // Aceptamos el ejemplo si tiene texto, O si tiene fuente, O si es Ad Hoc.
    // Solo lo descartamos si TODO está vacío o es basura (":").
    if ((!text || text === ':') && !source && !adHoc) {
      continue;
    }

    examples.push({
      text: text,
      source: source || undefined,
      isAdHoc: !!adHoc,
      adHocLabel: adHoc || undefined,
    });
  }

  return examples;
}

function parseSingleDefinitionNode(d: Element): Definition {
  // Mapeo exacto según reporte_estructuras.json
  const acepcion = getTextContent(d, 'Definition.Acepción') || undefined;
  
  // Usamos getInnerXML para contorno porque a veces trae cursivas
  const contorno = getInnerXML(d, 'Definition.Contorno') || getTextContent(d, 'Definition.Contorno') || undefined;
  
  const text = getInnerXML(d, 'Definition.Definición') || getTextContent(d, 'Definition.Definición') || '';
  const plainText = text.replace(/<[^>]+>/g, ''); // Texto limpio para búsquedas
  
  const usageLabel = getTextContent(d, 'Definition.Marca.de.uso') || undefined;
  const geographicLabel = getTextContent(d, 'Definition.Marca.geográfica') || undefined;
  const utc = getTextContent(d, 'Definition.UTC') || undefined;
  
  const examples = parseExamples(d);

  return {
    acepcion,
    contorno,
    text,
    plainText,
    usageLabel,
    geographicLabel,
    utc,
    examples,
  };
}

function parseNestedDefinitions(senseEl: Element): Definition[] {
  const defNodes = senseEl.getElementsByTagName('Definition');
  const defs: Definition[] = [];
  for (let i = 0; i < defNodes.length; i++) {
    defs.push(parseSingleDefinitionNode(defNodes.item(i) as Element));
  }
  return defs;
}

/**
 * PARSEO STATEFUL DE SENTIDOS
 * Fundamental para soportar la mezcla de <Sense> y <Definition> hermanos.
 */
function parseSenses(parentEl: Element): Sense[] {
  const senses: Sense[] = [];
  let currentSense: Sense | null = null;
  const children = parentEl.childNodes;

  for (let i = 0; i < children.length; i++) {
    const node = children.item(i) as Element;
    
    // Ignoramos nodos de texto puro (espacios en blanco)
    if (node.nodeType !== 1) continue;

    // Caso 1: <Sense> Explícito
    if (node.nodeName === 'Sense') {
      const senseNumber = getTextContent(node, 'Sense.SenseNumber') || undefined;
      const etimologia = getInnerXML(node, 'Sense.Etimología') || undefined;
      const scientificName = getInnerXML(node, 'Sense.Nombre.cientifico') || undefined;
      const pos = getTextContent(node, 'Sense.Categoría.Gramatical') || undefined;

      const internalDefinitions = parseNestedDefinitions(node);

      const newSense: Sense = {
        senseNumber,
        etimologia,
        scientificName,
        pos: pos || undefined,
        definitions: internalDefinitions,
      };

      senses.push(newSense);
      currentSense = newSense;
    }

    // Caso 2: <Definition> Huérfana (Estructura Legacy)
    else if (node.nodeName === 'Definition') {
      const orphanDef = parseSingleDefinitionNode(node);

      if (currentSense) {
        currentSense.definitions.push(orphanDef);
      } else {
        // Creamos un sentido implícito si la definición aparece antes que un Sense
        const implicitSense: Sense = { definitions: [orphanDef] };
        senses.push(implicitSense);
        currentSense = implicitSense;
      }
    }
  }

  return senses;
}

function parseSubentries(lemmaEl: Element): Subentry[] {
  const subs: Subentry[] = [];
  const children = lemmaEl.childNodes;

  for (let i = 0; i < children.length; i++) {
    const node = children.item(i) as Element;
    if (node.nodeType === 1 && node.nodeName === 'Subentry') {

      // Extraemos el título preservando <Underline>
      const sign = getInnerXML(node, 'Subentry.LemmaSign')
        || getTextContent(node, 'Subentry.LemmaSign')
        || '';

      const cleanSign = sign.replace(/\s+/g, ' ').trim();

      // Usamos la misma lógica robusta de Senses para las subentradas
      const senses = parseSenses(node);

      subs.push({
        sign: cleanSign,
        sense: senses
      });
    }
  }
  return subs;
}

// Función principal de parseo (Entrada Pública)
export async function parseXmlString(xmlString: string): Promise<Lemma[]> {
  const doc = parser.parseFromString(xmlString, 'text/xml');
  const lemmaNodes = doc.getElementsByTagName('Lemma');
  const lemmas: Lemma[] = [];

  for (let i = 0; i < lemmaNodes.length; i++) {
    const lemmaEl = lemmaNodes.item(i) as Element;
    
    const lemmaSign = getTextContent(lemmaEl, 'Lemma.LemmaSign') || '';
    const observations = getTextContent(lemmaEl, 'Observations') || undefined;

    // Etimología a nivel de Lema (Rara, pero existe en tus datos)
    const etimologia = getInnerXML(
      lemmaEl,
      'Lemma.Etimología..si.aplica.para.más.de.un.sense.'
    ) || undefined;

    // Variantes
    let variants: string | string[] | undefined = undefined;
    const variantsText = getTextContent(lemmaEl, 'Variants');
    if (variantsText) {
      variants = variantsText.split(/[,;|]/).map(s => s.trim());
    }

    // Ejecución de parseo profundo
    const senses = parseSenses(lemmaEl);
    const subentries = parseSubentries(lemmaEl);

    lemmas.push({
      lemmaSign: lemmaSign.trim(),
      etimologia,
      observations,
      variants,
      senses,
      subentries,
    });
  }
  return lemmas;
}

export async function parseXmlFile(filePath: string): Promise<Lemma[]> {
  const xml = await fs.readFile(filePath, 'utf-8');
  return parseXmlString(xml);
}

// CLI para pruebas rápidas
if (require.main === module) {
  (async () => {
    const fp = process.argv[2] || './data.xml';
    try {
      const result = await parseXmlFile(fp);
      // Imprime solo los primeros 3 para verificar estructura
      console.log(JSON.stringify(result.slice(0, 3), null, 2));
    } catch (err) {
      console.error('Error parsing file', err);
      process.exit(1);
    }
  })();
}