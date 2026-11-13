import { renderDocumentHtml, RenderDocumentHtmlInput } from './render-html';
import { DocumentTypeDescriptor } from '../descriptors/types';

const descriptor: DocumentTypeDescriptor = {
  id: 'invoice',
  label: 'Invoice',
  fields: [
    { key: 'issueDate', kind: 'date', label: 'Date' },
    { key: 'notes', kind: 'longText', label: 'Notes' },
  ],
  actions: [],
};

const base: RenderDocumentHtmlInput = {
  descriptor,
  instance: {
    id: 'doc-1',
    status: 'sent',
    data: { issueDate: '2026-10-28', notes: 'Thank you' },
    createdAt: new Date('2026-10-28'),
  },
  company: {
    name: 'Atelier Lumière SAS',
    address: '12 quai des Teinturiers',
    city: 'Lyon',
    postalCode: '69002',
    country: 'France',
  },
  referenceLabels: {},
};

/** The page without the stylesheet a template adds. */
function withoutTemplateStyle(html: string): string {
  const start = html.indexOf('<style data-template-style=');
  if (start === -1) return html;
  const end = html.indexOf('</style>', start) + '</style>'.length;
  return html.slice(0, start).trimEnd() + html.slice(end);
}

describe('renderDocumentHtml, document template', () => {
  it('prints the classic template byte for byte when no template or "classic" is asked', () => {
    const none = renderDocumentHtml(base);
    expect(renderDocumentHtml({ ...base, branding: { template: 'classic' } })).toBe(none);
    expect(renderDocumentHtml({ ...base, branding: { template: null } })).toBe(none);
  });

  it('prints the same words with the atelier template, only the presentation changes', () => {
    const classic = renderDocumentHtml(base);
    const atelier = renderDocumentHtml({ ...base, branding: { template: 'atelier' } });
    expect(atelier).not.toBe(classic);
    expect(withoutTemplateStyle(atelier).trim()).toBe(classic.trim());
  });

  it('embeds its own title and interface faces with the atelier template', () => {
    const atelier = renderDocumentHtml({ ...base, branding: { template: 'atelier' } });
    expect(atelier).toMatch(/@font-face\s*\{[^}]*font-family:\s*"InvoicerrTemplateNewsreader"/);
    expect(atelier).toMatch(/@font-face\s*\{[^}]*font-family:\s*"InvoicerrTemplateFigtree"/);
  });

  it('keeps the customer accent colour and logo with the atelier template', () => {
    const atelier = renderDocumentHtml({
      ...base,
      branding: { template: 'atelier', accentColor: '#aa3311', logoDataUri: 'data:image/png;base64,AAAA' },
    });
    expect(atelier).toContain('#aa3311');
    expect(atelier).toContain('<img src="data:image/png;base64,AAAA" alt="" class="logo">');
  });

  it('lets a font the company picked win over the template interface face', () => {
    const atelier = renderDocumentHtml({ ...base, branding: { template: 'atelier', font: 'lora' } });
    const override = atelier.slice(atelier.indexOf('data-template-style="atelier"'));
    expect(override).not.toMatch(/body\s*\{[^}]*InvoicerrTemplateFigtree/);
  });

  it('embeds the sindhu stylesheet when the sindhu template is asked', () => {
    const sindhu = renderDocumentHtml({ ...base, branding: { template: 'sindhu' } });
    expect(sindhu).toContain('data-template-style="sindhu"');
    expect(sindhu).toContain('#063f32');
    expect(sindhu).toContain('#c89b3c');
    expect(sindhu).toContain('#f7f4ea');
  });

  it('prints Tax Invoice / Retail Invoice titles from invoiceFormat', () => {
    const tax = renderDocumentHtml({
      ...base,
      instance: { ...base.instance, data: { ...base.instance.data, invoiceFormat: 'b2b' } },
    });
    expect(tax).toContain('<title>Tax Invoice</title>');
    expect(tax).toContain('<div class="document-title">Tax Invoice</div>');

    const retail = renderDocumentHtml({
      ...base,
      instance: { ...base.instance, data: { ...base.instance.data, invoiceFormat: 'b2c' } },
    });
    expect(retail).toContain('<title>Retail Invoice</title>');
    expect(retail).toContain('<div class="document-title">Retail Invoice</div>');

    const plain = renderDocumentHtml(base);
    expect(plain).toContain('<title>Invoice</title>');
    expect(plain).toContain('<div class="document-title">Invoice</div>');
  });
});
