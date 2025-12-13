// parser-node-ts.ts
import { promises as fs } from 'fs';
import { DOMParser, XMLSerializer } from 'xmldom';
import { applyDataPatches } from './data-patcher';

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

// Helper seguro para trim
const trimOrEmpty = (s: string | null | undefined) => (s ? s.trim() : '');

function getFirstElement(parent: Element, tagName: string): Element | null {
  const list = parent.getElementsByTagName(tagName);
  if (list && list.length > 0) return list.item(0) as Element;
  return null;
}

function getTextContent(parent: Element, tagName: string): string {
  const el = getFirstElement(parent, tagName);
  return el ? trimOrEmpty(el.textContent) : '';
}

function transformXmlToHtml(xml: string): string {
  if (!xml) return '';
  return xml
    .replace(/<Bold>/gi, '<b>')
    .replace(/<\/Bold>/gi, '</b>')
    .replace(/<Italic>/gi, '<i>')
    .replace(/<\/Italic>/gi, '</i>')
    .replace(/<Underline>/gi, '<u>')
    .replace(/<\/Underline>/gi, '</u>')
    .replace(/\n/g, ' '); 
}

function getInnerXML(parent: Element, tagName: string): string {
  const el = getFirstElement(parent, tagName);
  if (!el) return '';
  
  let out = '';
  if (el.childNodes) {
    for (let i = 0; i < el.childNodes.length; i++) {
      const child = el.childNodes.item(i);
      out += serializer.serializeToString(child as any);
    }
  }
  return transformXmlToHtml(out.trim());
}

// --- NUEVAS FUNCIONES DE LIMPIEZA ---

/**
 * Elimina paréntesis () y corchetes [] de las cadenas.
 * Útil para Etimologías y Nombres Científicos.
 */
function cleanBrackets(text: string | undefined): string | undefined {
    if (!text) return undefined;
    // Elimina (, ), [, ] globalmente y limpia espacios resultantes
    return text.replace(/[\[\]\(\)]/g, '').trim();
}

/**
 * Elimina guiones largos (em-dash —) y medios (en-dash –) de los ejemplos.
 * También limpia el guión normal (-) si está al inicio, aunque es menos común.
 */
function cleanDashes(text: string): string {
    if (!text) return '';
    // \u2013 = en-dash (–), \u2014 = em-dash (—)
    return text.replace(/[\u2013\u2014]/g, '').trim();
}

// --- LOGICA DE PARSEO ---

function parseExamples(defEl: Element): Example[] {
  const examplesNodes = defEl.getElementsByTagName('Example');
  const examples: Example[] = [];

  for (let i = 0; i < examplesNodes.length; i++) {
    const exEl = examplesNodes.item(i) as Element;

    let text = getInnerXML(exEl, 'Example.Example');
    if (!text) text = getTextContent(exEl, 'Example.Example');
    
    const source = getTextContent(exEl, 'Example.Source');
    const adHoc = getTextContent(exEl, 'Example.Ad.hoc');

    // LIMPIEZA 1: Aplicamos cleanDashes al texto del ejemplo
    text = text ? cleanDashes(text) : '';

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

function parseNestedDefinitions(senseEl: Element): Definition[] {
  const defNodes = senseEl.getElementsByTagName('Definition');
  const defs: Definition[] = [];
  for (let i = 0; i < defNodes.length; i++) {
    defs.push(parseSingleDefinitionNode(defNodes.item(i) as Element));
  }
  return defs;
}

function parseSenses(parentEl: Element): Sense[] {
  const senses: Sense[] = [];
  let currentSense: Sense | null = null;
  const children = parentEl.childNodes;

  for (let i = 0; i < children.length; i++) {
    const node = children.item(i) as Element;
    if (node.nodeType !== 1) continue;

    if (node.nodeName === 'Sense') {
      const senseNumber = getTextContent(node, 'Sense.SenseNumber') || undefined;
      
      // LIMPIEZA 2: Etimología dentro del Sense
      let etimologia = getInnerXML(node, 'Sense.Etimología') || undefined;
      etimologia = cleanBrackets(etimologia);

      // LIMPIEZA 3: Nombre Científico
      let scientificName = getInnerXML(node, 'Sense.Nombre.cientifico') || undefined;
      scientificName = cleanBrackets(scientificName);

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
    else if (node.nodeName === 'Definition') {
      const orphanDef = parseSingleDefinitionNode(node);

      if (currentSense) {
        currentSense.definitions.push(orphanDef);
      } else {
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

      const sign = getInnerXML(node, 'Subentry.LemmaSign')
        || getTextContent(node, 'Subentry.LemmaSign')
        || '';
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

export async function parseXmlString(xmlString: string): Promise<Lemma[]> {
  const doc = parser.parseFromString(xmlString, 'text/xml');
  const lemmaNodes = doc.getElementsByTagName('Lemma');
  const lemmas: Lemma[] = [];

  for (let i = 0; i < lemmaNodes.length; i++) {
    const lemmaEl = lemmaNodes.item(i) as Element;
    
    const lemmaSign = getTextContent(lemmaEl, 'Lemma.LemmaSign') || '';
    const observations = getTextContent(lemmaEl, 'Observations') || undefined;

    // LIMPIEZA 4: Etimología a nivel de Lema
    let etimologia = getInnerXML(
      lemmaEl,
      'Lemma.Etimología..si.aplica.para.más.de.un.sense.'
    ) || undefined;
    etimologia = cleanBrackets(etimologia);

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
  const patchedLemmas = applyDataPatches(lemmas);
  return patchedLemmas;
}

export async function parseXmlFile(filePath: string): Promise<Lemma[]> {
  const xml = await fs.readFile(filePath, 'utf-8');
  return parseXmlString(xml);
}

if (require.main === module) {
  (async () => {
    const fp = process.argv[2] || './data.xml';
    try {
      const result = await parseXmlFile(fp);
      console.log(JSON.stringify(result.slice(0, 3), null, 2));
    } catch (err) {
      console.error('Error parsing file', err);
      process.exit(1);
    }
  })();
}