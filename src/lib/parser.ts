// parser-node-ts.ts
import { promises as fs } from 'fs';
import { DOMParser, XMLSerializer } from 'xmldom';

// --- TIPOS (Sin cambios) ---
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

const trimOrEmpty = (s: string | null | undefined) => (s ? s.trim() : '');

function getFirstElement(parent: Element, tagName: string): Element | null {
  const list = parent.getElementsByTagName(tagName);
  if (list && list.length > 0) return list.item(0) as Element;

  for (let i = 0; i < parent.childNodes.length; i++) {
    const node = parent.childNodes.item(i);
    if (node.nodeType === 1 && (node as Element).nodeName === tagName) {
      return node as Element;
    }
  }
  return null;
}

function getTextContent(parent: Element, tagName: string): string {
  const el = getFirstElement(parent, tagName);
  return el ? trimOrEmpty(el.textContent) : '';
}

function transformXmlToHtml(xml: string): string {
  return xml
    .replace(/<Bold>/gi, '<b>')
    .replace(/<\/Bold>/gi, '</b>')
    .replace(/<Italic>/gi, '<i>')
    .replace(/<\/Italic>/gi, '</i>')
    .replace(/<Underline>/gi, '<u>')
    .replace(/<\/Underline>/gi, '</u>');
}

function getInnerXML(parent: Element, tagName: string): string {
  const el = getFirstElement(parent, tagName);
  if (!el) return '';
  let out = '';
  for (let i = 0; i < el.childNodes.length; i++) {
    const child = el.childNodes.item(i);
    out += serializer.serializeToString(child as any);
  }
  return transformXmlToHtml(out.trim());
}

// --- LOGICA DE PARSEO ---

function parseExamples(defEl: Element): Example[] {
  const examplesNodes = defEl.getElementsByTagName('Example');
  const examples: Example[] = [];

  for (let i = 0; i < examplesNodes.length; i++) {
    const exEl = examplesNodes.item(i) as Element;

    // 1. Extracción cruda
    let text = getInnerXML(exEl, 'Example.Example') || getTextContent(exEl, 'Example.Example');
    const source = getTextContent(exEl, 'Example.Source');
    const adHoc = getTextContent(exEl, 'Example.Ad.hoc');

    // 2. Limpieza básica
    text = text ? text.trim() : '';

    // 3. FILTRO CRÍTICO:
    // Si el texto está vacío O es exactamente ":", saltamos esta iteración.
    // Al usar 'continue', el array se mantiene vacío y la UI no renderizará nada.
    if (!text || text === ':') {
      continue;
    }

    // 4. Solo si pasa el filtro, lo agregamos
    examples.push({
      text: text,
      source: source || undefined,
      isAdHoc: !!adHoc,
      adHocLabel: adHoc || undefined,
    });
  }

  return examples;
}

/**
 * Parsea un nodo <Definition> individual.
 * Extraído a función propia para manejar definiciones huérfanas o anidadas.
 */
function parseSingleDefinitionNode(d: Element): Definition {
  const acepcion = getTextContent(d, 'Definition.Acepción') || undefined;
  const contorno = getInnerXML(d, 'Definition.Contorno') || getTextContent(d, 'Definition.Contorno') || undefined;
  const text = getInnerXML(d, 'Definition.Definición') || getTextContent(d, 'Definition.Definición') || '';
  const plainText = text.replace(/<[^>]+>/g, '');
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

/**
 * Busca definiciones anidadas (comportamiento estándar)
 */
function parseNestedDefinitions(senseEl: Element): Definition[] {
  const defNodes = senseEl.getElementsByTagName('Definition');
  const defs: Definition[] = [];
  for (let i = 0; i < defNodes.length; i++) {
    defs.push(parseSingleDefinitionNode(defNodes.item(i) as Element));
  }
  return defs;
}

/**
 * LOGICA CLAVE: Parseo de Senses Stateful.
 * Maneja tanto estructura anidada como estructura plana (mixed siblings).
 */
function parseSenses(parentEl: Element): Sense[] {
  const senses: Sense[] = [];

  // Mantenemos referencia al último sentido procesado para inyectarle definiciones huérfanas
  let currentSense: Sense | null = null;

  const children = parentEl.childNodes;

  for (let i = 0; i < children.length; i++) {
    const node = children.item(i) as Element;

    // Caso 1: Encontramos un nodo <Sense> explícito
    if (node.nodeName === 'Sense') {
      // Si teníamos un sentido acumulándose, ya está en el array (por referencia), 
      // pero actualizamos el puntero `currentSense` al nuevo.

      const senseNumber = getTextContent(node, 'Sense.SenseNumber') || undefined;
      const etimologia = getInnerXML(node, 'Sense.Etimología') || undefined;
      const scientificName = getInnerXML(node, 'Sense.Nombre.cientifico') || getTextContent(node, 'Sense.Nombre.cientifico') || undefined;
      const pos = getTextContent(node, 'Sense.Categoría.Gramatical') || undefined;

      // Intentamos buscar definiciones anidadas (estándar)
      const internalDefinitions = parseNestedDefinitions(node);

      const newSense: Sense = {
        senseNumber,
        etimologia,
        scientificName,
        pos: pos || undefined,
        definitions: internalDefinitions,
      };

      senses.push(newSense);
      currentSense = newSense; // Actualizamos el puntero actual
    }

    // Caso 2: Encontramos una <Definition> que es hermana directa (Estructura rota/plana)
    else if (node.nodeName === 'Definition') {
      const orphanDef = parseSingleDefinitionNode(node);

      if (currentSense) {
        // Escenario de recuperación: Agregamos a sentido previo
        currentSense.definitions.push(orphanDef);
      } else {
        // Escenario extremo: Definición aparece ANTES que cualquier Sense.
        // Creamos un sentido implícito.
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
    if (node.nodeName === 'Subentry') {

      // CAMBIO AQUÍ: Usamos getInnerXML para preservar <Underline> -> <u>
      // Subentry.LemmaSign suele ser el contenedor del título
      const sign = getInnerXML(node, 'Subentry.LemmaSign')
        || getTextContent(node, 'Subentry.LemmaSign')
        || '';

      // Limpieza de espacios (pero preservando el HTML interno)
      const cleanSign = sign.replace(/\s+/g, ' ').trim();

      const senses = parseSenses(node);

      subs.push({
        sign: cleanSign,
        sense: senses
      });
    }
  }
  return subs;
}

// Función principal de parseo
export async function parseXmlString(xmlString: string): Promise<Lemma[]> {
  const doc = parser.parseFromString(xmlString, 'text/xml');
  const lemmaNodes = doc.getElementsByTagName('Lemma');
  const lemmas: Lemma[] = [];

  for (let i = 0; i < lemmaNodes.length; i++) {
    const lemmaEl = lemmaNodes.item(i) as Element;
    const lemmaSign = getTextContent(lemmaEl, 'Lemma.LemmaSign') || '';
    const observations = getTextContent(lemmaEl, 'Observations') || undefined;

    const etimologia = getInnerXML(
      lemmaEl,
      'Lemma.Etimología..si.aplica.para.más.de.un.sense.'
    ) || undefined;

    let variants: string | string[] | undefined = undefined;
    const variantsText = getTextContent(lemmaEl, 'Variants');
    if (variantsText) {
      variants = variantsText.split(/[,;|]/).map(s => s.trim());
    }

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

// CLI helper si se ejecuta directo con ts-node
if (require.main === module) {
  (async () => {
    const fp = process.argv[2] || './data.xml';
    try {
      const result = await parseXmlFile(fp);
      console.log(JSON.stringify(result.slice(0, 10), null, 2));
    } catch (err) {
      console.error('Error parsing file', err);
      process.exit(1);
    }
  })();
}
