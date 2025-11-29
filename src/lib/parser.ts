/**
 * parser-node-ts.ts
 *
 * Parser TypeScript para transformar XML léxico (lemmas, senses, definitions, examples, subentries)
 * en una estructura JSON jerárquica pensada para MongoDB / PostgreSQL JSONB.
 *
 * Dependencias:
 *   npm i xmldom
 *   npm i -D typescript ts-node @types/node
 *
 * Uso (ejemplo):
 *   import { parseXmlFile } from './parser-node-ts';
 *   const data = await parseXmlFile('./public/db/ecuatorianismos.xml');
 *   console.log(JSON.stringify(data[0], null, 2));
 */

import { promises as fs } from 'fs';
import { DOMParser, XMLSerializer } from 'xmldom';

// Tipos
export type Example = {
  text: string;
  source?: string;
  isAdHoc?: boolean;
  adHocLabel?: string;
};

export type Definition = {
  acepcion?: string;
  text: string; // mantiene etiquetas <Bold>, <Italic>, <Underline> en HTML-like
  plainText: string; // texto plano para búsquedas
  usageLabel?: string;
  geographicLabel?: string;
  utc?: string;
  examples: Example[];
};

export type Sense = {
  senseNumber?: string;
  pos?: string; // categoría gramatical
  definitions: Definition[];
};

export type Subentry = {
  sign: string;
  sense: Sense[]; // puede tener múltiples senses
};

export type Lemma = {
  lemmaSign: string;
  observations?: string;
  variants?: string | string[];
  senses: Sense[];
  subentries: Subentry[];
};

// Utilidades DOM
const parser = new DOMParser();
const serializer = new XMLSerializer();

const trimOrEmpty = (s: string | null | undefined) => (s ? s.trim() : '');

function getFirstElement(parent: Element, tagName: string): Element | null {
  const list = parent.getElementsByTagName(tagName);
  return list && list.length > 0 ? (list.item(0) as Element) : null;
}

function getTextContent(parent: Element, tagName: string): string {
  const el = getFirstElement(parent, tagName);
  return el ? trimOrEmpty(el.textContent) : '';
}

function transformXmlToHtml(xml: string): string {
  return xml
    .replace(/<Bold>/g, '<b>')
    .replace(/<\/Bold>/g, '</b>')
    .replace(/<Italic>/g, '<i>')
    .replace(/<\/Italic>/g, '</i>')
    .replace(/<Underline>/g, '<u>')
    .replace(/<\/Underline>/g, '</u>');
}

function getInnerXML(parent: Element, tagName: string): string {
  const el = getFirstElement(parent, tagName);
  if (!el) return '';
  // Serializa children para preservar etiquetas internas (<Bold>, <Italic>, etc.)
  let out = '';
  for (let i = 0; i < el.childNodes.length; i++) {
    const child = el.childNodes.item(i);
    out += serializer.serializeToString(child as any);
  }
  return transformXmlToHtml(out.trim());
}

function nodeListToArray<T>(nl: NodeListOf<Element>, mapper: (e: Element) => T): T[] {
  const arr: T[] = [];
  for (let i = 0; i < nl.length; i++) arr.push(mapper(nl.item(i) as Element));
  return arr;
}

// Parsers específicos
function parseExamples(defEl: Element): Example[] {
  const examplesNodes = defEl.getElementsByTagName('Example');
  const examples: Example[] = [];

  for (let i = 0; i < examplesNodes.length; i++) {
    const exEl = examplesNodes.item(i) as Element;
    const text = getInnerXML(exEl, 'Example.Example') || getTextContent(exEl, 'Example.Example');
    const source = getTextContent(exEl, 'Example.Source');
    const adHoc = getTextContent(exEl, 'Example.Ad.hoc');

    examples.push({
      text: text || '',
      source: source || undefined,
      isAdHoc: !!adHoc,
      adHocLabel: adHoc || undefined,
    });
  }

  return examples;
}

function parseDefinitions(senseEl: Element): Definition[] {
  const defNodes = senseEl.getElementsByTagName('Definition');
  const defs: Definition[] = [];

  for (let i = 0; i < defNodes.length; i++) {
    const d = defNodes.item(i) as Element;

    const acepcion = getTextContent(d, 'Definition.Acepción') || undefined;
    // Conservamos la definición con su posible marcado interno
    const text = getInnerXML(d, 'Definition.Definición') || getTextContent(d, 'Definition.Definición') || '';
    // Creamos una versión en texto plano para búsquedas
    const plainText = text.replace(/<[^>]+>/g, '');

    const usageLabel = getTextContent(d, 'Definition.Marca.de.uso') || undefined;
    const geographicLabel = getTextContent(d, 'Definition.Marca.geográfica') || undefined;
    const utc = getTextContent(d, 'Definition.UTC') || undefined;
    const examples = parseExamples(d);

    defs.push({
      acepcion,
      text,
      plainText,
      usageLabel,
      geographicLabel,
      utc,
      examples,
    });
  }

  return defs;
}

function parseSenses(parentEl: Element): Sense[] {
  const senses: Sense[] = [];
  const children = parentEl.childNodes;

  for (let i = 0; i < children.length; i++) {
    const node = children.item(i) as Element;
    if (node.nodeName === 'Sense') {
      const senseNumber = getTextContent(node, 'Sense.SenseNumber') || undefined;
      const pos = getTextContent(node, 'Sense.Categoría.Gramatical') || undefined;
      const definitions = parseDefinitions(node);

      senses.push({
        senseNumber,
        pos: pos || undefined,
        definitions,
      });
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
      // Subentry.LemmaSign puede contener <Underline> dentro
      const signEl = getFirstElement(node, 'Subentry.LemmaSign') || getFirstElement(node, 'Subentry.LemmaSign');
      const sign = signEl ? trimOrEmpty(signEl.textContent || '') : getTextContent(node, 'Subentry.LemmaSign') || '';

      // Notar: dentro de Subentry puede haber uno o más Sense
      const senses = parseSenses(node);

      subs.push({ sign, sense: senses });
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

    // Observaciones y variantes, si existen en complementary-like structures
    const observations = getTextContent(lemmaEl, 'Observations') || undefined;
    let variants: string | string[] | undefined = undefined;
    const variantsText = getTextContent(lemmaEl, 'Variants');
    if (variantsText) {
      variants = variantsText.split(/[,;|]/).map(s => s.trim());
    }

    const senses = parseSenses(lemmaEl);
    const subentries = parseSubentries(lemmaEl);

    lemmas.push({
      lemmaSign: lemmaSign.trim(),
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
