const normalizeHeader = (header) => {
    const h = header.toLowerCase().trim();
    if (h.includes('lucro') || h.includes('profit') || h.includes('p/l') || h.includes('ganhos') || h.includes('resultado')) return 'profit';
    if (h.includes('data') || h.includes('date') || h.includes('resolução') || h.includes('start time') || h.includes('settled') || h.includes('colocada') || h.includes('efetuada')) return 'date';
    if (h.includes('mercado') || h.includes('market') || h.includes('descrição') || h.includes('evento') || h.includes('item')) return 'market';
    return h;
};

const h1 = "Mercado";
const h2 = "Hora de inicio";
const h3 = "Data da última resolução";
const h4 = "Lucro/Perda (R$)";

console.log(normalizeHeader(h1));
console.log(normalizeHeader(h2));
console.log(normalizeHeader(h3));
console.log(normalizeHeader(h4));

