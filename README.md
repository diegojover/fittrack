# FitTrack — PWA (versão 1.0)

Aplicação web progressiva em português (Portugal), sem conta e sem backend.

## Funcionalidades
- Plano semanal A/B/C (segunda, quarta e sexta).
- Marcar exercícios individualmente como concluídos.
- Calendário mensal com estado diário.
- Biblioteca com instruções passo a passo e ilustrações vetoriais locais.
- Registo de peso corporal.
- Exportar/importar cópia de segurança JSON.
- Armazenamento local no navegador.
- Service worker para cache e utilização offline após a primeira visita.

## Instalação no Android
1. Publica o conteúdo desta pasta num alojamento HTTPS (por exemplo, GitHub Pages).
2. Abre o endereço HTTPS no Chrome do Android.
3. Menu ⋮ → **Adicionar ao ecrã principal** ou **Instalar aplicação**.
4. Confirma. A FitTrack passa a aparecer como aplicação no telemóvel.

Não é necessário Play Store, conta ou servidor de dados.

## Dados e privacidade
Os dados ficam no `localStorage` do navegador e não são enviados para qualquer servidor. Limpar os dados do navegador pode apagar o histórico. Usa regularmente **Mais → Exportar cópia de segurança**.

## Nota de segurança
As ilustrações são esquemáticas, não vídeos de instrução. Começa sem carga ou com carga muito leve, executa apenas movimentos confortáveis e interrompe se surgir dor. Em caso de doença, lesão ou limitação física, pede validação a um profissional de saúde/fisioterapia antes de iniciar o plano.
