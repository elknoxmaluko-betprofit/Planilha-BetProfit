const parseCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim().length > 0);
    const headerLine = lines[0].toLowerCase();
    
    const normalizeHeader = (header) => {
      const h = header.toLowerCase().trim();
      if (h.includes('lucro') || h.includes('profit') || h.includes('p/l') || h.includes('pl')) return 'profit';
      if (h.includes('data') || h.includes('date') || h.includes('resolução') || h.includes('start time') || h.includes('settled')) return 'date';
      if (h.includes('mercado') || h.includes('market') || h.includes('descrição') || h.includes('desc') || h.includes('evento')) return 'market';
      return h;
    };

    const headers = headerLine.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(h => normalizeHeader(h.replace(/["\r]/g, '')));
    
    console.log("Headers:", headers);
}

parseCSV(`"Mercado","Data da resolução","Lucro/Perda (EUR)"
"Futebol / Palmeiras x Flamengo / Probabilidades","09-jul-26 13:00:00","10.00"`);

parseCSV(`Item,Settled Date,Profit/Loss
"Football","09-Jul-26 13:00:00","10.00"`);
