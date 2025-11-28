import { describe, it, expect } from "vitest";

import { parseXmlString } from "./parser";

describe('Módulo de ...', () => {
    it('debería ...', async () => {
        // Preparar
        const input = '<Lemma><Lemma.LemmaSign>chucha</Lemma.LemmaSign></Lemma>';
        const expectedOutput = [{
            lemmaSign: 'chucha',
            observations: undefined,
            variants: undefined,
            senses: [],
            subentries: []
        }];
        // Ejecutar
        const result = await parseXmlString(input);
        // Validar
        expect(result).toEqual(expectedOutput);
    });
});